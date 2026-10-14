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

// Regression for the el() boolean-attribute bug: `disabled:false` was being set
// as the literal attribute `disabled="false"`, which browsers still treat as
// "disabled". That disabled EVERY Next/Previous button and broke all navigation.
// These tests prove every Next button actually advances.

async function gotoActivity(label) {
  await page.goto(BASE);
  await page.click(`.activity-card:has-text("${label}")`);
}

async function readCounter(locator) {
  const text = (await locator.textContent()).trim();
  const m = text.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { cur: Number(m[1]), total: Number(m[2]) } : null;
}

test('flashcard Next button advances to the next card', async () => {
  await gotoActivity('Flashcards');
  await page.waitForSelector('.btn:has-text("Start")');
  await page.click('.btn:has-text("Start")');
  await page.waitForSelector('.flashcard-controls');
  const ctr = page.locator('.flashcard-controls');
  const before = await readCounter(page.locator('.flashcard-controls .muted'));
  const nextBtn = ctr.locator('.btn', { hasText: 'Next' });
  assert.ok(!(await nextBtn.isDisabled()), 'flashcard Next must not be disabled');
  await nextBtn.click();
  const after = await readCounter(page.locator('.flashcard-controls .muted'));
  assert.equal(after.cur, before.cur + 1, 'flashcard index should advance by one');
});

test('grammar Next button advances to the next lesson', async () => {
  await gotoActivity('Grammar');
  await page.waitForSelector('.grammar-table');
  const nav = page.locator('.row.mb');
  const before = await readCounter(nav.locator('.muted'));
  const nextBtn = nav.locator('.btn', { hasText: 'Next' });
  assert.ok(!(await nextBtn.isDisabled()), 'grammar Next must not be disabled');
  await nextBtn.click();
  const after = await readCounter(nav.locator('.muted'));
  assert.equal(after.cur, before.cur + 1);
});

test('reading Next button advances to the next passage', async () => {
  await gotoActivity('Reading');
  await page.waitForSelector('.passage');
  const nav = page.locator('.row.mb');
  const before = await readCounter(nav.locator('.muted'));
  const nextBtn = nav.locator('.btn', { hasText: 'Next' });
  assert.ok(!(await nextBtn.isDisabled()), 'reading Next must not be disabled');
  await nextBtn.click();
  const after = await readCounter(nav.locator('.muted'));
  assert.equal(after.cur, before.cur + 1);
});

test('writing Next button advances to the next prompt', async () => {
  await gotoActivity('Writing');
  await page.waitForSelector('textarea');
  const nav = page.locator('.row.mb');
  const before = await readCounter(nav.locator('.muted'));
  const nextBtn = nav.locator('.btn', { hasText: 'Next' });
  assert.ok(!(await nextBtn.isDisabled()), 'writing Next must not be disabled');
  await nextBtn.click();
  const after = await readCounter(nav.locator('.muted'));
  assert.equal(after.cur, before.cur + 1);
});

test('speaking Next button advances to the next prompt', async () => {
  await gotoActivity('Speaking');
  await page.waitForSelector('.speak-prompt');
  const nav = page.locator('.row.mb');
  const before = await readCounter(nav.locator('.muted'));
  const nextBtn = nav.locator('.btn', { hasText: 'Next' });
  assert.ok(!(await nextBtn.isDisabled()), 'speaking Next must not be disabled');
  await nextBtn.click();
  const after = await readCounter(nav.locator('.muted'));
  assert.equal(after.cur, before.cur + 1);
});
