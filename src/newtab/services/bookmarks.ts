import type { BookmarkTreeNode } from '@/types';

type Folder = BookmarkTreeNode & { folderType?: string; syncing?: boolean };

export async function ensureRoot(): Promise<BookmarkTreeNode> {
  const [tree] = await chrome.bookmarks.getTree();
  const bars = (tree.children ?? []).filter(
    (node) =>
      (node as Folder).folderType === 'bookmarks-bar' && !node.unmodifiable
  );
  // Preserve existing local data, even when Chrome also exposes an account bar.
  const stored = await chrome.storage.local.get('rootFolderId');
  for (const bar of bars) {
    const existing = bar.children?.find(
      (node) => node.id === stored.rootFolderId && !node.url
    );
    if (existing) return existing;
  }
  const existing = bars
    .flatMap((bar) => bar.children ?? [])
    .find(
      (node) => node.title === 'TobyNext' && !node.url && !node.unmodifiable
    );
  const bar = bars.find((node) => (node as Folder).syncing) ?? bars[0];
  if (!bar) throw new Error('No writable bookmarks bar is available.');
  const root =
    existing ??
    (await chrome.bookmarks.create({ parentId: bar.id, title: 'TobyNext' }));
  await chrome.storage.local.set({ rootFolderId: root.id });
  return root;
}

export async function folders(parentId: string) {
  return (await chrome.bookmarks.getChildren(parentId)).filter(
    (node) => !node.url
  );
}

async function ensureChildren(parentId: string, title: string) {
  const children = await folders(parentId);
  return children.length
    ? children
    : [await chrome.bookmarks.create({ parentId, title })];
}

export async function loadSelection(workspaceId?: string, spaceId?: string) {
  // Web Locks also serialize initialization across multiple new-tab pages.
  return navigator.locks.request('tobynext-initialize', async () => {
    const rootFolder = await ensureRoot();
    const workspaces = await ensureChildren(rootFolder.id, 'Toby');
    const currentWorkspace =
      workspaces.find((node) => node.id === workspaceId) ?? workspaces[0];
    const spaces = await ensureChildren(currentWorkspace.id, 'My Collection');
    const currentSpace =
      spaces.find((node) => node.id === spaceId) ?? spaces[0];
    const collections = await folders(currentSpace.id);
    return {
      rootFolder,
      workspaces,
      currentWorkspace,
      spaces,
      currentSpace,
      collections,
    };
  });
}
