import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countWords } from '../../js/wordcount.js';

test('countWords counts whitespace-separated words', () => {
  assert.equal(countWords('Ich lerne Deutsch.'), 3);
});

test('countWords handles multiple spaces and newlines', () => {
  assert.equal(countWords('  Ich   lerne\nDeutsch  '), 3);
});

test('countWords empty string is 0', () => {
  assert.equal(countWords(''), 0);
});

test('countWords whitespace-only is 0', () => {
  assert.equal(countWords('   \n  '), 0);
});

test('countWords counts German compound punctuation as one word', () => {
  assert.equal(countWords('Guten Morgen, wie geht es dir?'), 6);
});

test('countWords null/undefined is 0', () => {
  assert.equal(countWords(null), 0);
  assert.equal(countWords(undefined), 0);
});
