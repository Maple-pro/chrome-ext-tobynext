import React, { useEffect, useState, JSX } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface WorkspacesProps {
    folder: BookmarkTreeNode;
}


const workspaceColors = [
    "bg-red-300", "bg-orange-300", "bg-amber-300", "bg-yellow-300", "bg-lime-300",
    "bg-green-300", "bg-emerald-300", "bg-teal-300", "bg-cyan-300", "bg-sky-300",
]

const Workspaces = (props: WorkspacesProps): JSX.Element => {
    const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);
    const rootFolder = props.folder;

    useEffect(() => {
        if (!rootFolder || rootFolder.url) {
            console.error('Cannot find TobyNext root folder');
            return;
        }

        const fetchWorkspaces = async () => {
            const children = await new Promise<BookmarkTreeNode[]>((resolve) => {
                chrome.bookmarks.getChildren(rootFolder.id, resolve);
            });
            for (const child of children) {
                if (!child.url) {
                    console.log("find workspace: " + child.title);
                    setWorkspaces(prevWorkspaces => [...prevWorkspaces, child]);
                }
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <div id="workspaces" className="flex flex-col justify-center items-center px-5">
            {workspaces.map((workspace, index) => (
                <div id={"workspace-" + workspace.title} className={`mb-10 w-40 h-40 flex justify-center items-center rounded-xl ${workspaceColors[index % workspaceColors.length]}`}>
                    <div id="workspace-name" className="truncate text-center text-[#FAFAFA] leading-[1.2]">
                        {workspace.title}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Workspaces;