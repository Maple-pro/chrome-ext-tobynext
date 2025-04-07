const rootFolderTitle = "TobyNext";
const bookmarkBarId = "1";


const findRootFolder = async (): Promise<BookmarkTreeNode> => {
    let rootFolder: BookmarkTreeNode | undefined;

    const result = await new Promise<BookmarkTreeNode[]>((resolve) => {
        chrome.bookmarks.search({title: rootFolderTitle}, resolve);
    })

    rootFolder = result.find(
        (b) => b.title === rootFolderTitle && b.parentId === bookmarkBarId
    );
    
    if (!rootFolder || rootFolder.url) {
        rootFolder = await createRootFolder();
    }

    return rootFolder!;
}

const createRootFolder = async (): Promise<BookmarkTreeNode> => {
    return await chrome.bookmarks.create({ parentId: bookmarkBarId, title: rootFolderTitle})
}

export default findRootFolder;