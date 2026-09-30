import type { BookmarkTreeNode } from '@/types';

export type DragItem =
  | { type: 'bookmark' | 'space' | 'collection' | 'workspace'; id: string }
  | { type: 'tab'; id: number };
export const DRAG_MIME = 'application/x-tobynext-item';
let active: DragItem | undefined;
let suppressClickUntil = 0;

export function beginDrag(transfer: DataTransfer, item: DragItem) {
  active = item;
  transfer.effectAllowed = item.type === 'tab' ? 'copy' : 'move';
  transfer.setData(DRAG_MIME, JSON.stringify(item));
}
export function endDrag() {
  active = undefined;
  suppressClickUntil = Date.now() + 250;
}
export function canClick() {
  return !active && Date.now() > suppressClickUntil;
}
export function activeDrag() {
  return active;
}
export function acceptsDrag(types: DragItem['type'][]) {
  return active !== undefined && types.includes(active.type);
}
export function readDrag(transfer: DataTransfer): DragItem | undefined {
  try {
    const item = JSON.parse(transfer.getData(DRAG_MIME));
    if (active && item.type === active.type && item.id === active.id)
      return active;
  } catch {
    /* Ignore foreign or malformed drag payloads. */
  }
  return undefined;
}

/** Chrome adjusts same-parent moves itself; pass the pre-removal position. */
export function insertionIndex(target: BookmarkTreeNode, after: boolean) {
  return (target.index ?? 0) + (after ? 1 : 0);
}
export async function dropItem(
  item: DragItem,
  parentId: string,
  targetId?: string,
  after = false
) {
  if (item.type !== 'tab' && item.id === targetId) return;
  const target = targetId
    ? (await chrome.bookmarks.get(targetId))[0]
    : undefined;
  if (target && target.parentId !== parentId)
    throw new Error('Drop destination has moved. Please retry.');
  if (item.type === 'tab') {
    const tab = await chrome.tabs.get(item.id);
    if (!tab.url) throw new Error('This tab has no URL to save.');
    await chrome.bookmarks.create({
      parentId,
      title: tab.title ?? tab.url,
      url: tab.url,
      ...(target ? { index: insertionIndex(target, after) } : {}),
    });
  } else {
    const [source] = await chrome.bookmarks.get(item.id);
    if (target && source.parentId !== parentId && item.type !== 'bookmark')
      throw new Error('Items can only be sorted within the same parent.');
    const moveOptions = target
      ? { parentId, index: insertionIndex(target, after) }
      : {
          parentId,
          ...(['space', 'collection'].includes(item.type) ? { index: 0 } : {}),
        };
    await chrome.bookmarks.move(source.id, {
      ...moveOptions,
    });
  }
}
