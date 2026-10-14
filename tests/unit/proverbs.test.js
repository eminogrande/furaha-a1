import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proverbs, PROVERB_SOURCE } from '../../data/proverbs.js';
import { filterProverbs, searchProverbs, buildProverbQuiz } from '../../js/proverbs.js';

test('proverbs data: 18 German sayings and 6 Swahili proverbs', () => {
  const german = proverbs.filter((p) => p.type === 'german');
  const swahili = proverbs.filter((p) => p.type === 'swahili');
  assert.equal(german.length, 18, 'expected 18 German sayings');
  assert.equal(swahili.length, 6, 'expected 6 Swahili proverbs');
  assert.equal(proverbs.length, 24);
});

test('every German entry has phrase, literal, meaning, example and note', () => {
  for (const p of proverbs.filter((x) => x.type === 'german')) {
    assert.ok(p.phrase, `${p.id} missing phrase`);
    assert.ok(p.literal, `${p.id} missing literal translation`);
    assert.ok(p.en, `${p.id} missing English meaning`);
    assert.ok(p.sw, `${p.id} missing Swahili meaning`);
    assert.ok(p.example.de && p.example.en && p.example.sw, `${p.id} incomplete example`);
    assert.ok(p.note.en && p.note.sw, `${p.id} incomplete learning note`);
    assert.equal(p.enrichment, true, `${p.id} should be marked enrichment`);
  }
});

test('every Swahili entry has original phrase, de+en translations, item and source', () => {
  for (const p of proverbs.filter((x) => x.type === 'swahili')) {
    assert.ok(p.phrase, `${p.id} missing Swahili proverb`);
    assert.ok(p.de, `${p.id} missing German translation`);
    assert.ok(p.en, `${p.id} missing English translation`);
    assert.ok(p.item, `${p.id} missing source item number`);
    assert.equal(p.source, PROVERB_SOURCE.url,
      `${p.id} source must equal the Swahili proverbs source URL`);
    assert.ok(p.literal && p.note && p.note.en && p.note.sw, `${p.id} incomplete fields`);
  }
});

test('Swahili entries use the exact six source item numbers', () => {
  const items = proverbs.filter((x) => x.type === 'swahili').map((p) => p.item).sort();
  assert.deepEqual(items, ['2739', '2745', '2748', '2758', '2764', '2771']);
});

test('German translations of Swahili proverbs are not traditional German sayings', () => {
  const germanPhrases = new Set(proverbs.filter((x) => x.type === 'german').map((p) => p.phrase));
  for (const p of proverbs.filter((x) => x.type === 'swahili')) {
    assert.ok(!germanPhrases.has(p.de.trim()),
      `Swahili German translation '${p.de}' must not masquerade as a traditional German saying`);
  }
});

test('filterProverbs returns only the selected type', () => {
  const g = filterProverbs(proverbs, 'german');
  const s = filterProverbs(proverbs, 'swahili');
  assert.ok(g.length > 0 && g.every((p) => p.type === 'german'));
  assert.ok(s.length > 0 && s.every((p) => p.type === 'swahili'));
  assert.equal(filterProverbs(proverbs, 'all').length, proverbs.length);
  assert.equal(filterProverbs(proverbs, undefined).length, proverbs.length);
});

test('searchProverbs matches German, English and Swahili text', () => {
  const de = searchProverbs(proverbs, 'eile');
  assert.ok(de.some((p) => p.id === 'gp01'), 'search should find German "Eile"');
  const en = searchProverbs(proverbs, 'apple');
  assert.ok(en.some((p) => p.id === 'gp09'), 'search should find English "apple"');
  const sw = searchProverbs(proverbs, 'saburi');
  assert.ok(sw.some((p) => p.id === 'sp04'), 'search should find Swahili "saburi"');
  // Swahili original phrase matches even for swahili entries
  const orig = searchProverbs(proverbs, 'mbegu');
  assert.ok(orig.some((p) => p.id === 'sp05'), 'search should find Swahili proverb phrase');
});

test('searchProverbs empty or no-match', () => {
  assert.equal(searchProverbs(proverbs, '').length, proverbs.length);
  assert.equal(searchProverbs(proverbs, 'zzzqqq').length, 0);
});

test('buildProverbQuiz yields unique meaning options including the correct one', () => {
  const q = buildProverbQuiz(proverbs, 6);
  assert.equal(q.length, 6);
  for (const item of q) {
    assert.equal(item.options.length, 4, 'must have 4 options');
    assert.equal(new Set(item.options).size, 4, 'options must be unique');
    assert.ok(item.options.includes(item.correct), 'correct meaning must be among options');
    assert.ok(item.prompt.includes(item.correct) === false, 'prompt quotes the phrase, not the meaning');
    assert.ok(item.explanation, 'explanation required');
  }
});

test('buildProverbQuiz respects count and stays within pool', () => {
  assert.equal(buildProverbQuiz(proverbs, 3).length, 3);
  assert.ok(buildProverbQuiz(proverbs, 9999).length <= proverbs.length);
});

test('buildProverbQuiz options are real meanings from the pool', () => {
  const q = buildProverbQuiz(proverbs, 5);
  const meanings = new Set(proverbs.map((p) => p.en));
  for (const item of q) {
    for (const opt of item.options) assert.ok(meanings.has(opt), `option '${opt}' not a real meaning`);
  }
});
