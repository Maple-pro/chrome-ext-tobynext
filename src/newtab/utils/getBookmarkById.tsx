type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const getBookmarkById = (id: string, bookmarks: BookmarkTreeNode[]): BookmarkTreeNode | null => {
    return bookmarks.find(b => b.id === id) || null;
};

export default getBookmarkById;