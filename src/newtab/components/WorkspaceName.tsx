import React, { JSX } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface WorkspaceNameProps {
    workspace: BookmarkTreeNode,
}

const WorkspaceName = (props: WorkspaceNameProps): JSX.Element => {
    return (
        <div id="workspace-name-container" className="w-full h-50 flex-none flex items-center justify-start pl-12 text-[18px] border-b-1 border-solid border-toby-outline-gray">
            {props.workspace.title}
        </div>
    );
}

export default WorkspaceName;