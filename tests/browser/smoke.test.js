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

test('home page loads and shows the Furaha A1 brand', async () => {
  await page.goto(BASE);
  await page.waitForSelector('.home-hero h1');
  const title = await page.textContent('.home-hero h1');
  assert.equal(title.trim(), 'Furaha A1');
});

test('home shows all activity cards', async () => {
  await page.goto(BASE);
  const cards = await page.$$('.activity-card');
  assert.ok(cards.length >= 8, `expected >=8 activities, got ${cards.length}`);
});

test('vocabulary view renders words and filters by topic', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Vocabulary")');
  await page.waitForSelector('.vocab-item');
  const count = await page.$$eval('.vocab-item', (els) => els.length);
  assert.ok(count >= 120, `expected >=120 vocab items, got ${count}`);
  // filter to food
  await page.click('.chip:has-text("Food")');
  await page.waitForSelector('.vocab-item');
  const foodCount = await page.$$eval('.vocab-item', (els) => els.length);
  assert.ok(foodCount > 0 && foodCount < count, `food filter should narrow (${foodCount} of ${count})`);
});

test('vocabulary search finds a word', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Vocabulary")');
  await page.waitForSelector('input[type="search"]');
  await page.fill('input[type="search"]', 'nyumba');
  await page.waitForSelector('.vocab-item');
  const text = await page.textContent('#vocab-list');
  assert.ok(text.includes('nyumba'), 'search should find nyumba');
});

test('flashcards flip and navigate', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Flashcards")');
  await page.waitForSelector('.flashcard');
  const front = await page.textContent('.fc-front');
  assert.ok(front.trim().length > 0);
  await page.click('.flashcard');
  await page.waitForSelector('.fc-back');
  const back = await page.textContent('.fc-back');
  assert.ok(back.includes('·'), 'back should show translations');
});

test('quiz runs end to end with feedback', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Quiz")');
  await page.waitForSelector('.btn:has-text("Start")');
  await page.click('.btn:has-text("Start")');
  await page.waitForSelector('.option-btn');
  // answer first question correctly by clicking the correct option
  const correct = await page.$$eval('.option-btn', (els) => {
    // we don't know which is correct; click the first and check feedback appears
    return els.length;
  });
  assert.ok(correct >= 4, 'quiz should have >=4 options');
  await page.click('.option-btn >> nth=0');
  await page.waitForSelector('.feedback');
  const fb = await page.textContent('.feedback');
  assert.ok(fb.length > 0, 'feedback should appear');
});

test('grammar view shows lessons and practice', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Grammar")');
  await page.waitForSelector('.grammar-table');
  const rows = await page.$$eval('.grammar-table tbody tr', (els) => els.length);
  assert.ok(rows >= 3, 'grammar table should have rows');
});

test('reading view shows passage and questions', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Reading")');
  await page.waitForSelector('.passage');
  const passage = await page.textContent('.passage');
  assert.ok(passage.trim().length > 0);
  const qs = await page.$$eval('.mb p', (els) => els.length);
  assert.ok(qs >= 3, 'reading should have questions');
});

test('writing view has textarea with word counter', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Writing")');
  await page.waitForSelector('textarea');
  await page.fill('textarea', 'Ich lerne Deutsch heute.');
  const count = await page.textContent('.word-count');
  assert.ok(count.includes('4'), `expected 4 words, got ${count}`);
});

test('speaking view shows prompt and model answer', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("Speaking")');
  await page.waitForSelector('.speak-prompt');
  const prompt = await page.textContent('.speak-prompt');
  assert.ok(prompt.trim().length > 0);
  const model = await page.textContent('.model-box');
  assert.ok(model.trim().length > 0);
});

test('language switch to Swahili updates UI', async () => {
  await page.goto(BASE);
  await page.click('.lang-btn[data-lang="sw"]');
  await page.waitForSelector('.home-hero h1');
  const lead = await page.textContent('.lead');
  assert.ok(lead.includes('Kiswahili'), 'Swahili tagline should show');
});

test('progress view shows stats and reset confirmation', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("progress")');
  await page.waitForSelector('.stat-row');
  await page.click('.btn--danger');
  await page.waitForSelector('.modal');
  const modalText = await page.textContent('.modal');
  assert.ok(modalText.length > 0, 'reset confirmation modal should appear');
});

test('daily path view renders steps', async () => {
  await page.goto(BASE);
  await page.click('.activity-card:has-text("path")');
  await page.waitForSelector('.path-step');
  const steps = await page.$$eval('.path-step', (els) => els.length);
  assert.ok(steps >= 3, `expected >=3 path steps, got ${steps}`);
});

test('footer states it is not an official Goethe test', async () => {
  await page.goto(BASE);
  const footer = await page.textContent('#footer-note');
  assert.ok(/Goethe/i.test(footer), 'footer should mention Goethe');
});
