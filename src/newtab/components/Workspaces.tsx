import React, { useEffect, useState, JSX } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface WorkspacesProps {
    folder: BookmarkTreeNode;
}


const Workspaces = (props: WorkspacesProps): JSX.Element => {
    const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);
    const rootFolder = props.folder;
    useEffect(() => {
        if (!rootFolder || !rootFolder.children) {
            console.error('Cannot find TobyNext root folder');
            console.log(rootFolder);
            console.log(rootFolder.children);
            return;
        }
        
        console.log("1");

        for (const workspaceFolder of rootFolder.children) {
            if (!workspaceFolder.url) {
                console.log("find workspace: " + workspaceFolder.title);
                setWorkspaces([...workspaces, workspaceFolder]);
            }
        }
        console.log("2");

        if (workspaces.length == 0) {
            chrome.bookmarks.create(
                {"parentId": rootFolder.id, "title": "Workspace1"},
                function(newFolder) {
                    console.log("Create a workspace folder: " + newFolder.title);
                }
            )
        }
        console.log("3");
    }, []);

    return (
        <div id="workspaces" className="flex flex-col justify-center px-5">
            {workspaces.map(workspace => (
                <div id="workspace" className="mb-10 w-40 h-40 bg-green-50">
                    {workspace.title}
                </div>
            ))}
        </div>
    );
}

export default Workspaces;