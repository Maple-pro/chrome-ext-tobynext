export default async (folder: BookmarkTreeNode): Promise<BookmarkTreeNode[]> => {
    if (!folder || folder.url) {
        if (folder) {
            console.error("Bookmark is not folder: " + folder.title);
        }
        Promise.resolve();
        return [];
    }

    const children = await new Promise<BookmarkTreeNode[]>((resolve) => {
        chrome.bookmarks.getChildren(folder.id, resolve);
    });

    let subFolders = [];
    for (const child of children) {
        if (!child.url) {
            subFolders.push(child);
        }
    }

    return subFolders;
}