import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vocabulary, TOPICS, TOPIC_IDS } from '../../data/vocabulary.js';

test('vocabulary has at least 120 words', () => {
  assert.ok(vocabulary.length >= 120, `expected >=120 words, got ${vocabulary.length}`);
});

test('vocabulary covers all 12 A1 topics', () => {
  assert.equal(TOPIC_IDS.length, 12);
  const covered = new Set(vocabulary.map((w) => w.topic));
  for (const id of TOPIC_IDS) {
    assert.ok(covered.has(id), `topic ${id} has no words`);
  }
});

test('every topic has at least 8 words', () => {
  const counts = {};
  for (const w of vocabulary) counts[w.topic] = (counts[w.topic] || 0) + 1;
  for (const id of TOPIC_IDS) {
    assert.ok(counts[id] >= 8, `topic ${id} has only ${counts[id]} words`);
  }
});

test('every word has required fields with correct shape', () => {
  for (const w of vocabulary) {
    assert.ok(w.id, 'missing id');
    assert.ok(w.de, 'missing de');
    assert.ok(w.en, 'missing en');
    assert.ok(w.sw, 'missing sw');
    assert.ok(w.topic, 'missing topic');
    assert.ok(TOPIC_IDS.includes(w.topic), `bad topic ${w.topic}`);
    // German nouns carry an article; verbs/adjectives do not
        if (w.article) {
          assert.ok(['der', 'die', 'das'].includes(w.article), `bad article ${w.article} for ${w.de}`);
        } else {
          assert.ok(w.pos && ['verb', 'adj', 'adv'].includes(w.pos), 'non-noun ' + w.de + ' needs needs pos field');
        }
    // example sentence with translations
    assert.ok(w.example && w.example.de && w.example.en && w.example.sw,
      `missing example translations for ${w.de}`);
  }
});

test('word ids are unique', () => {
  const ids = vocabulary.map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('TOPICS provides human labels in en and sw', () => {
  for (const id of TOPIC_IDS) {
    const t = TOPICS[id];
    assert.ok(t, `missing TOPICS entry for ${id}`);
    assert.ok(t.en, `missing en label for ${id}`);
    assert.ok(t.sw, `missing sw label for ${id}`);
  }
});
