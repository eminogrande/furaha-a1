import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAudioManifest, emptyAudioManifest } from '../../js/audio.js';

test('flat manifest maps exact text to url by trimmed lookup', () => {
  const man = parseAudioManifest({
    'die Familie': 'audio/lessons/abc.mp3',
    'Meine Familie ist groß.': 'audio/lessons/def.mp3',
  });
  assert.equal(man.size, 2);
  assert.equal(man.urlFor('die Familie'), 'audio/lessons/abc.mp3');
  assert.equal(man.hasText('die Familie'), true);
});

test('lookup trims surrounding whitespace from both key and query', () => {
  const man = parseAudioManifest({
    '  der Vater  ': 'audio/lessons/xyz.mp3',
  });
  assert.equal(man.urlFor('der Vater'), 'audio/lessons/xyz.mp3');
  assert.equal(man.hasText('  der Vater  '), true);
});

test('nested-by-language manifest is flattened', () => {
  const man = parseAudioManifest({
    de: { 'das Haus': 'a.mp3' },
    sw: { 'nyumba': 'b.mp3' },
  });
  assert.equal(man.urlFor('das Haus'), 'a.mp3');
  assert.equal(man.urlFor('nyumba'), 'b.mp3');
});

test('missing text reports unavailable honestly', () => {
  const man = parseAudioManifest({ 'das Haus': 'a.mp3' });
  assert.equal(man.hasText('gar nicht da'), false);
  assert.equal(man.urlFor('gar nicht da'), null);
});

test('empty manifest reports not loaded so UI never fakes audio', () => {
  const man = emptyAudioManifest();
  assert.equal(man.loaded, false);
  assert.equal(man.size, 0);
  assert.equal(man.hasText('anything'), false);
  assert.equal(man.urlFor('anything'), null);
});
