import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterVocab, searchVocab } from '../../js/vocab.js';
import { vocabulary } from '../../data/vocabulary.js';

test('filterVocab by topic returns only that topic', () => {
  const r = filterVocab(vocabulary, { topic: 'food' });
  assert.ok(r.length > 0);
  assert.ok(r.every((w) => w.topic === 'food'));
});

test('filterVocab with no topic returns all', () => {
  const r = filterVocab(vocabulary, {});
  assert.equal(r.length, vocabulary.length);
});

test('filterVocab with all topics returns all', () => {
  const r = filterVocab(vocabulary, { topic: 'all' });
  assert.equal(r.length, vocabulary.length);
});

test('searchVocab matches German word case-insensitively', () => {
  const r = searchVocab(vocabulary, 'haus');
  assert.ok(r.some((w) => w.de === 'das Haus'));
});

test('searchVocab matches English translation', () => {
  const r = searchVocab(vocabulary, 'bread');
  assert.ok(r.some((w) => w.en === 'bread'));
});

test('searchVocab matches Swahili translation', () => {
  const r = searchVocab(vocabulary, 'nyumba');
  assert.ok(r.some((w) => w.sw === 'nyumba'));
});

test('searchVocab empty query returns all', () => {
  const r = searchVocab(vocabulary, '');
  assert.equal(r.length, vocabulary.length);
});

test('searchVocab no match returns empty', () => {
  const r = searchVocab(vocabulary, 'zzzqqq');
  assert.equal(r.length, 0);
});

test('searchVocab matches article+word combined', () => {
  const r = searchVocab(vocabulary, 'das haus');
  assert.ok(r.some((w) => w.de === 'das Haus'));
});
