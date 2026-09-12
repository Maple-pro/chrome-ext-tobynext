import type { BookmarkTreeNode } from '@/types';

import { folders } from '../services/bookmarks';

export default function fetchSubFolder(folder: BookmarkTreeNode) {
  return folders(folder.id);
}
