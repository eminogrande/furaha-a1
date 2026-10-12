import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../../js/storage.js';

// In-memory localStorage stand-in that can be made to throw / corrupt.
function makeBackend() {
  const store = new Map();
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    _store: store,
  };
}

test('get returns parsed value when valid JSON', () => {
  const s = createStorage(makeBackend());
  s.set('key', { a: 1 });
  assert.deepEqual(s.get('key'), { a: 1 });
});

test('get returns default when key missing', () => {
  const s = createStorage(makeBackend());
  assert.deepEqual(s.get('nope', [1, 2]), [1, 2]);
});

test('get returns default when stored value is corrupt JSON', () => {
  const b = makeBackend();
  b._store.set('bad', '{not valid json');
  const s = createStorage(b);
  assert.deepEqual(s.get('bad', 'fallback'), 'fallback');
});

test('get returns default when backend throws (storage unavailable)', () => {
  const b = makeBackend();
  b.getItem = () => { throw new Error('denied'); };
  const s = createStorage(b);
  assert.deepEqual(s.get('x', 42), 42);
});

test('set stores JSON and does not throw when backend throws', () => {
  const b = makeBackend();
  b.setItem = () => { throw new Error('quota'); };
  const s = createStorage(b);
  assert.doesNotThrow(() => s.set('x', { ok: true }));
});

test('set stores round-trippable JSON', () => {
  const b = makeBackend();
  const s = createStorage(b);
  s.set('obj', { list: [1, 2, 3], s: 'hi' });
  assert.deepEqual(s.get('obj'), { list: [1, 2, 3], s: 'hi' });
});

test('remove deletes key and returns default afterwards', () => {
  const b = makeBackend();
  const s = createStorage(b);
  s.set('k', 1);
  s.remove('k');
  assert.equal(s.get('k', null), null);
});

test('isAvailable reports false when backend throws on getItem', () => {
  const b = makeBackend();
  b.getItem = () => { throw new Error('denied'); };
  const s = createStorage(b);
  assert.equal(s.isAvailable(), false);
});

test('isAvailable reports true for working backend', () => {
  const s = createStorage(makeBackend());
  assert.equal(s.isAvailable(), true);
});
