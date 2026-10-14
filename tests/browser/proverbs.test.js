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

test('home shows the Proverbs & sayings activity card', async () => {
  await page.goto(BASE);
  const card = await page.textContent('.activity-card:has-text("Proverbs")');
  assert.ok(card.includes('sayings'), 'card should be labeled "Proverbs & sayings"');
});

test('home activity card switches to "Methali na misemo" in Swahili', async () => {
  await page.goto(BASE);
  await page.click('.lang-btn[data-lang="sw"]');
  await page.waitForSelector('.activity-card');
  const card = await page.textContent('.activity-card:has-text("Methali")');
  assert.ok(card.includes('misemo'), 'Swahili card should say "Methali na misemo"');
});

async function openProverbs() {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Proverbs")');
  await page.waitForSelector('.proverb-card');
}

test('proverbs view renders all 24 cards', async () => {
  await openProverbs();
  const count = await page.$$eval('.proverb-card', (els) => els.length);
  assert.equal(count, 24, `expected 24 proverb cards, got ${count}`);
});

test('type filter narrows to German and to Swahili', async () => {
  await openProverbs();
  await page.click('.chip:has-text("Swahili")');
  await page.waitForSelector('.proverb-card');
  const sw = await page.$$eval('.proverb-card', (els) => els.length);
  assert.equal(sw, 6, `expected 6 Swahili proverbs, got ${sw}`);
  await page.click('.chip:has-text("German sayings")');
  await page.waitForSelector('.proverb-card');
  const de = await page.$$eval('.proverb-card', (els) => els.length);
  assert.equal(de, 18, `expected 18 German sayings, got ${de}`);
  await page.click('.chip:has-text("All")');
  await page.waitForSelector('.proverb-card');
  assert.equal(await page.$$eval('.proverb-card', (els) => els.length), 24);
});

test('proverbs search matches German, English and Swahili', async () => {
  await openProverbs();
  // German
  await page.fill('input[type="search"]', 'Morgenstund');
  await page.waitForTimeout(50);
  let cards = await page.$$eval('.proverb-card', (els) => els.length);
  assert.equal(cards, 1, 'German search "Morgenstund" should find 1 card');
  // English
  await page.fill('input[type="search"]', 'apple');
  await page.waitForTimeout(50);
  cards = await page.$$eval('.proverb-card', (els) => els.length);
  assert.equal(cards, 1, 'English search "apple" should find 1 card');
  // Swahili search returns a proverb
  await page.fill('input[type="search"]', 'saburi');
  await page.waitForTimeout(50);
  cards = await page.$$eval('.proverb-card', (els) => els.length);
  assert.ok(cards >= 1, 'Swahili search "saburi" should find a card');
});

test('translation toggle reveals meanings and literal translations', async () => {
  await openProverbs();
  const hidden = await page.$('.proverb-body');
  assert.equal(hidden, null, 'translations should be hidden by default');
  await page.click('.proverb-toggle');
  await page.waitForSelector('.proverb-body');
  const text = await page.textContent('.proverb-card');
  assert.ok(text.toLowerCase().includes('literal'), 'literal translation should show');
});

test('Swahili proverbs show clickable source citation with item number', async () => {
  await openProverbs();
  await page.click('.chip:has-text("Swahili")');
  await page.waitForSelector('.proverb-card');
  await page.click('.proverb-toggle');
  await page.waitForSelector('.proverb-source');
  const href = await page.getAttribute('.proverb-source a', 'href');
  assert.equal(href, 'https://swahiliproverbs.afrst.illinois.edu/hurry.html');
  const label = await page.textContent('.proverb-source');
  assert.ok(/2739|2745|Sources/i.test(label), 'item number or source note should appear');
});

test('audio preview uses the real MP3 (duration > 0) and shows the German transcript with translations', async () => {
  await openProverbs();
  const audio = page.locator('#proverbs-audio');
  assert.equal(await audio.count(), 1, 'audio element must exist');
  const src = await page.getAttribute('#proverbs-audio source', 'src');
  assert.ok(src.includes('audio/proverbs-preview.mp3'), 'audio should point to the repo MP3');
  const preload = await audio.getAttribute('preload');
  assert.equal(preload, 'none');
  await page.evaluate(() => {
    const a = document.getElementById('proverbs-audio');
    return new Promise((resolve) => {
      a.addEventListener('loadedmetadata', () => resolve(true), { once: true });
      a.load();
    });
  });
  const duration = await audio.evaluate((a) => a.duration);
  assert.ok(Number.isFinite(duration) && duration > 0, `duration should be > 0, got ${duration}`);
  const label = await page.textContent('.audio-label');
  assert.ok(/AI-generated Nuri voice/i.test(label), 'label should credit the AI Nuri voice');
  const transcript = await page.textContent('.audio-transcript');
  assert.ok(transcript.includes('\u00dcbung macht den Meister.'), 'transcript should include the German line');
  assert.ok(transcript.includes('Practice makes perfect.'), 'transcript should include English translation');
  assert.ok(/Kujizoeza huja ustadi/.test(transcript), 'transcript should include Swahili translation');
});

test('proverb quiz completes and retries mistakes', async () => {
  await openProverbs();
  await page.click('.btn:has-text("Start")'); // "Start proverb quiz" (EN)
  await page.waitForSelector('.option-btn');
  const correctMap = {};
  // -------- round 1: answer every question (click first option) --------
  for (let guard = 0; guard < 60; guard++) {
    if ((await page.locator('.option-btn').count()) === 0) break;
    const prompt = (await page.textContent('.quiz h3, h3')).trim();
    await page.locator('.option-btn >> nth=0').click();
    await page.waitForSelector('.feedback');
    const correctText = (await page.textContent('.option-btn.is-correct')).trim();
    correctMap[prompt] = correctText;
    const done = { hasText: 'Done' };
    const next = { hasText: 'Next' };
    if (await page.locator('.btn', done).count()) await page.locator('.btn', done).click();
    else await page.locator('.btn', next).click();
  }
  const finish = await page.textContent('.card');
  const mistakesMatch = finish.match(/Mistakes:\s*(\d+)/);
  const mistakes = mistakesMatch ? Number(mistakesMatch[1]) : 0;
  assert.ok(mistakes >= 1, `round 1 should have mistakes to retry, got ${mistakes}`);
  // -------- retry round: answer each retry question correctly from capture --------
  await page.click('.btn:has-text("Retry mistakes")');
  await page.waitForSelector('.option-btn');
  for (let guard = 0; guard < 60; guard++) {
    if ((await page.locator('.option-btn').count()) === 0) break;
    const prompt = (await page.textContent('.quiz h3, h3')).trim();
    const correct = correctMap[prompt];
    assert.ok(correct, `no captured answer for prompt: ${prompt}`);
    await page.getByRole('button', { name: correct, exact: true }).click();
    await page.waitForSelector('.feedback');
    const done = { hasText: 'Done' };
    const next = { hasText: 'Next' };
    if (await page.locator('.btn', done).count()) await page.locator('.btn', done).click();
    else await page.locator('.btn', next).click();
  }
  const retryFinish = await page.textContent('.card');
  assert.ok(/well done|no mistakes|Score: 4 \/ 4|Score: 3 \/ 3/i.test(retryFinish),
    `retry should end with all-correct feedback, got: ${retryFinish}`);
});
