import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
let browser;
let page;

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});

after(async () => {
  await browser.close();
});

async function gotoHome() {
  await page.goto(BASE);
  await page.waitForSelector('.home-hero h1');
}

async function openActivity(label) {
  await gotoHome();
  await page.click(`.activity-card:has-text("${label}")`);
}

// Read the persisted review store for a track.
async function reviewStore(track) {
  return page.evaluate((tr) => {
    const raw = localStorage.getItem('furaha.review');
    if (!raw) return {};
    const d = JSON.parse(raw);
    return (d && d[tr] && d[tr].items) || {};
  }, track);
}

test('flashcard reveal, self-rate persists, and rating adds no objective correctness', async () => {
  await openActivity('Flashcards');
  await page.waitForSelector('.btn:has-text("Start")');
  await page.click('.btn:has-text("Start")');
  await page.waitForSelector('.flashcard');
  // reveal the back
  await page.click('.flashcard');
  await page.waitForSelector('.fc-back');
  // self-rate "Got it"
  await page.click('.flashcard-verdict .btn:has-text("Got it")');
  // rating advances the queue; the entry must persist with selfFam but NO objective attempt
  const items = await reviewStore('de');
  const rated = Object.values(items).find((e) => e.selfFam === true);
  assert.ok(rated, 'a flashcard rating should persist a self-familiar entry');
  assert.equal(rated.attempts, 0, 'self-rating must not count as an objective attempt');
  assert.equal(rated.correct, 0, 'self-rating must not add objective correctness');
  assert.ok(rated.flashGotIt >= 1, 'got-it rating should be recorded');
});

test('German playback actually advances audio time', async () => {
  await openActivity('Vocabulary');
  await page.waitForSelector('.play-btn');
  // click the first play control (a German word)
  await page.locator('.play-btn >> nth=0').click();
  // give the audio a moment to start decoding/playing
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => {
    const a = window.__audioEl;
    return { currentTime: a.currentTime, paused: a.paused, src: a.src };
  });
  assert.ok(state.src && state.src.length > 0, 'audio element should have a source');
  assert.ok(state.currentTime > 0, `playback time should advance, got ${state.currentTime}`);
  assert.equal(state.paused, false, 'audio should be playing');
});

test('listening hides the German word until answered, then reveals it and records progress', async () => {
  await openActivity('Listening');
  await page.waitForSelector('.btn:has-text("Start")');
  await page.click('.btn:has-text("Start")');
  await page.waitForSelector('.option-btn');
  // before answering: no feedback, and the listen control shows only a play button (no word text)
    assert.equal(await page.$('.feedback'), null, 'no feedback before answering');
    assert.equal(await page.locator('.listen-control .play-btn').count(), 1, 'listen control should have a play button');
    const ctrlText = (await page.textContent('.listen-control')).trim();
    assert.ok(ctrlText.length <= 2, `German word/transcript must stay hidden before answering, got "${ctrlText}"`);
  // answer the first option
  await page.locator('.option-btn >> nth=0').click();
  await page.waitForSelector('.feedback');
  const fb = await page.textContent('.feedback');
  assert.ok(fb.includes('“'), 'feedback should reveal the German transcript in quotes');
  // progress: a listening objective check was recorded
  const items = await reviewStore('de');
  const listening = Object.values(items).find((e) => e.type === 'listening');
  assert.ok(listening, 'a listening check should be recorded');
  assert.equal(listening.attempts, 1, 'one listening attempt should be recorded');
});

test('Swahili lesson quiz runs and retries mistakes', async () => {
  await gotoHome();
  // switch to the Emin (Swahili) track
  await page.click('.track-card:has-text("Emin")');
  await page.waitForSelector('.activity-card:has-text("Lessons")');
  await page.click('.activity-card:has-text("Lessons")');
  await page.waitForSelector('.lesson-card');
  await page.locator('.lesson-card >> nth=0').click();
  await page.waitForSelector('.btn:has-text("Start questions")');
  await page.click('.btn:has-text("Start questions")');
  await page.waitForSelector('.option-btn');
    // answer every question; deliberately get at least one wrong so retry is exercised
    let q = 0;
        let prevCorrect = null;
        for (let guard = 0; guard < 40; guard++) {
          if ((await page.locator('.option-btn').count()) === 0) break;
          const opts = page.locator('.option-btn');
          const n = await opts.count();
          let idx = 0;
          if (q === 1 && prevCorrect) {
            // force a wrong answer on the second question: click the option that was
            // correct on the FIRST question — a different question has a different answer
            for (let i = 0; i < n; i++) {
              if ((await opts.nth(i).textContent()).trim() === prevCorrect) { idx = i; break; }
            }
          }
          await opts.nth(idx).click();
          await page.waitForSelector('.feedback');
          // capture the correct answer from this question's feedback for the next one
          prevCorrect = (await page.locator('.option-btn.is-correct').textContent()).trim();
          q++;
      const done = { hasText: 'Next' };
      if (await page.locator('.btn', done).count()) await page.locator('.btn', done).click();
      else break;
    }
    const finish = await page.textContent('.card');
    const mistakesMatch = finish.match(/Mistakes:\s*(\d+)/);
    const mistakes = mistakesMatch ? Number(mistakesMatch[1]) : 0;
    assert.ok(mistakes >= 1, `Swahili lesson quiz should produce mistakes to retry, got ${mistakes}`);
  // retry mistakes
  await page.click('.btn:has-text("Retry mistakes")');
  await page.waitForSelector('.option-btn');
  assert.ok((await page.locator('.option-btn').count()) >= 1, 'retry should present questions');
});

test('daily news loads items and exposes audio controls', async () => {
  await openActivity('Daily news');
  await page.waitForSelector('.news-item');
  const items = await page.$$eval('.news-item', (els) => els.length);
  assert.ok(items >= 3, `expected >=3 news items, got ${items}`);
  const playBtns = await page.$$eval('.play-btn', (els) => els.length);
  assert.ok(playBtns >= 1, 'news should expose audio play controls');
});

test('daily news knowledge check runs and gives feedback', async () => {
  await openActivity('Daily news');
  await page.waitForSelector('.news-item');
  await page.click('.btn:has-text("Knowledge check")');
  await page.waitForSelector('.option-btn');
  assert.ok((await page.locator('.option-btn').count()) >= 3, 'news quiz should have options');
  await page.locator('.option-btn >> nth=0').click();
  await page.waitForSelector('.feedback');
  const fb = await page.textContent('.feedback');
  assert.ok(fb.length > 0, 'news quiz should give feedback');
});

test('history lesson hides the body while answering questions', async () => {
  // reset persisted track so we land on the German track
  await page.evaluate(() => localStorage.clear());
  await gotoHome();
  await page.click('.activity-card:has-text("Lessons")');
  await page.waitForSelector('.lesson-card');
  // open the history lesson (German track)
  await page.click('.lesson-card:has-text("1871")');
  await page.waitForSelector('.btn:has-text("Start questions")');
  await page.click('.btn:has-text("Start questions")');
  await page.waitForSelector('.option-btn');
  // body must be hidden during the check
  assert.equal(await page.$('.lesson-body'), null, 'lesson body must be hidden during the check');
  const notice = await page.textContent('.notice');
  assert.ok(notice.length > 0, 'a hidden-reading notice should be shown');
});
