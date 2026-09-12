import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  beginDrag,
  DRAG_MIME,
  dropItem,
  endDrag,
  insertionIndex,
  readDrag,
} from '../src/newtab/services/drag.ts';

afterEach(() => {
  endDrag();
  delete globalThis.chrome;
});
test('insertion indices use the current destination order, leaving removal adjustment to Chrome', () => {
  assert.equal(insertionIndex({ parentId: 'p', index: 3 }, false), 3);
  assert.equal(insertionIndex({ parentId: 'p', index: 3 }, true), 4);
  assert.equal(insertionIndex({ parentId: 'p', index: 0 }, false), 0);
  assert.equal(insertionIndex({ parentId: 'q', index: 3 }, true), 4);
});
test('malformed, foreign and stale drag payloads are ignored', () => {
  const data = new Map();
  const transfer = {
    setData: (k, v) => data.set(k, v),
    getData: (k) => data.get(k),
  };
  beginDrag(transfer, { type: 'bookmark', id: 'a' });
  assert.deepEqual(readDrag(transfer), { type: 'bookmark', id: 'a' });
  data.set(DRAG_MIME, '{');
  assert.equal(readDrag(transfer), undefined);
  data.set(DRAG_MIME, JSON.stringify({ type: 'bookmark', id: 'other' }));
  assert.equal(readDrag(transfer), undefined);
  endDrag();
  assert.equal(readDrag(transfer), undefined);
});
test('drop fetches live indices and can append within the current collection', async () => {
  const moves = [];
  globalThis.chrome = {
    bookmarks: {
      get: async (id) => [{ id, parentId: 'p', index: id === 'a' ? 0 : 2 }],
      move: async (...args) => moves.push(args),
    },
  };
  await dropItem({ type: 'bookmark', id: 'a' }, 'p', 'b', true);
  await dropItem({ type: 'bookmark', id: 'a' }, 'p');
  await dropItem({ type: 'bookmark', id: 'a' }, 'p', 'a');
  assert.deepEqual(moves, [
    ['a', { parentId: 'p', index: 3 }],
    ['a', { parentId: 'p' }],
  ]);
});
test('saving a tab copies its current URL and does not close it', async () => {
  const created = [];
  globalThis.chrome = {
    tabs: {
      get: async () => ({ url: 'https://example.org', title: 'Live title' }),
    },
    bookmarks: { create: async (item) => created.push(item) },
  };
  await dropItem({ type: 'tab', id: 7 }, 'p');
  assert.deepEqual(created, [
    { parentId: 'p', title: 'Live title', url: 'https://example.org' },
  ]);
});
test('moving a space to a different workspace via sorting is rejected', async () => {
  globalThis.chrome = {
    bookmarks: {
      get: async () => [{ id: 'a', parentId: 'old' }],
      move: () => assert.fail('must not move'),
    },
  };
  await dropItem({ type: 'space', id: 'a' }, 'other');
});
