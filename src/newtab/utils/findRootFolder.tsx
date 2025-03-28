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
    var rootFolder: BookmarkTreeNode | undefined;
    chrome.bookmarks.create(
        {"parentId": bookmarkBarId, "title": rootFolderTitle},
        function(newFolder) {
            rootFolder = newFolder;
        }
    )

    return rootFolder!;
}

export default findRootFolder;