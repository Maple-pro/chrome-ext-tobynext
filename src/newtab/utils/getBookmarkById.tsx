import type { BookmarkTreeNode } from '@/types';

const getBookmarkById = (
  id: string,
  bookmarks: BookmarkTreeNode[]
): BookmarkTreeNode | undefined => {
  return bookmarks.find((b) => b.id === id) || undefined;
};

export default getBookmarkById;
