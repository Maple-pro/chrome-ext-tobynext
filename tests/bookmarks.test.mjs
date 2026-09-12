import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { ensureRoot } from '../src/newtab/services/bookmarks.ts';

afterEach(() => {
  delete globalThis.chrome;
});
function mock(bars, stored = {}) {
  const created = [];
  globalThis.chrome = {
    bookmarks: {
      getTree: async () => [{ children: bars }],
      create: async (data) => {
        created.push(data);
        return { ...data, id: 'new' };
      },
    },
    storage: {
      local: {
        get: async () => stored,
        set: async (data) => Object.assign(stored, data),
      },
    },
  };
  return created;
}
test('preserves existing local data when an account bookmarks bar also exists', async () => {
  const root = { id: 'old-root', title: 'TobyNext' };
  const created = mock([
    { id: 'account', folderType: 'bookmarks-bar', syncing: true, children: [] },
    { id: 'local', folderType: 'bookmarks-bar', children: [root] },
  ]);
  assert.equal((await ensureRoot()).id, root.id);
  assert.deepEqual(created, []);
});
test('honors the stored root even after a user renames it', async () => {
  mock(
    [
      {
        id: 'bar',
        folderType: 'bookmarks-bar',
        children: [{ id: 'saved', title: 'Renamed' }],
      },
    ],
    { rootFolderId: 'saved' }
  );
  assert.equal((await ensureRoot()).id, 'saved');
});
test('new installations select the account bar dynamically', async () => {
  const created = mock([
    { id: 'A', folderType: 'bookmarks-bar', syncing: true, children: [] },
  ]);
  await ensureRoot();
  assert.deepEqual(created, [{ parentId: 'A', title: 'TobyNext' }]);
});
test('missing writable bars fail explicitly without creating a misplaced folder', async () => {
  const created = mock([
    { id: 'managed', folderType: 'bookmarks-bar', unmodifiable: 'managed' },
  ]);
  await assert.rejects(ensureRoot(), /No writable bookmarks bar/);
  assert.deepEqual(created, []);
});
