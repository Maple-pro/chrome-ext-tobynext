export default async (folder: BookmarkTreeNode, setSubBookmark: Function) => {
    if (!folder || folder.url) {
        if (folder) {
            console.error("Bookmark is not folder: " + folder.title);
        }
        Promise.resolve();
        return;
    }

    const children = await new Promise<BookmarkTreeNode[]>(resolve => {
        chrome.bookmarks.getChildren(folder.id, resolve);
    });

    let subBookmarks = [];
    for (const child of children) {
        if (child.url) {
            subBookmarks.push(child);
        }
    }

    setSubBookmark(subBookmarks);
}