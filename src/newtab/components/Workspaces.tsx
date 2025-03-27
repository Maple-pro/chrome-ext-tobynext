import React, { useEffect, useState, JSX } from "react";
import fetchSubFolder from "../utils/fetchSubFolder";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

const workspaceColors = [
    "bg-red-300", "bg-orange-300", "bg-amber-300", "bg-yellow-300", "bg-lime-300",
    "bg-green-300", "bg-emerald-300", "bg-teal-300", "bg-cyan-300", "bg-sky-300",
]

const outlineColors = [
    "outline-red-300", "outline-orange-300", "outline-amber-300", "outline-yellow-300", "outline-lime-300",
    "outline-green-300", "outline-emerald-300", "outline-teal-300", "outline-cyan-300", "outline-sky-300",
]

interface WorkspacesProps {
    rootFolder: BookmarkTreeNode,
    getCurrentWorkspace: Function,
    forceUpdate: number,
    currentWorkspace: BookmarkTreeNode | undefined,
}

const Workspaces = (props: WorkspacesProps): JSX.Element => {
    const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);

    useEffect(() => {
        console.log("current workspace: " + props.currentWorkspace?.title);
    }, [props.currentWorkspace])

    // get all worksapces
    useEffect(() => {
        fetchSubFolder(props.rootFolder, setWorkspaces);
    }, [props.rootFolder, props.forceUpdate]);

    // When `props.currentWorkspace` is undefined and workspaces is not empty, use default workspace
    useEffect(() => {
        if (workspaces.length > 0 && !props.currentWorkspace) {
            // notify parent component
            props.getCurrentWorkspace(workspaces[0]); 
            console.log("Use default workspace: " + workspaces[0].title);
        }
    }, [workspaces, props.currentWorkspace, props.getCurrentWorkspace]);

    return (
        <div id="workspaces" className="flex flex-col justify-center items-center px-5">
            {workspaces.map((workspace, index) => (
                <div
                    id={"workspace-" + workspace.title}
                    onClick={() => props.getCurrentWorkspace(workspace)}
                    className={`mb-10 w-40 h-40 flex justify-center items-center rounded-xl cursor-pointer
                        ${workspaceColors[index % workspaceColors.length]} 
                        ${props.currentWorkspace && props.currentWorkspace.id === workspace.id ? 
                            `outline-2 outline-offset-2 outline-solid ${outlineColors[index % outlineColors.length]}` : ''}`}
                >
                    <div id="workspace-name" className="truncate text-center text-[#FAFAFA] leading-[1.2]">
                        {workspace.title}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Workspaces;