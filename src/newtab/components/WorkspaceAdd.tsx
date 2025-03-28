import React, { JSX, useState } from "react";
import addIcon from "@assets/add-workspace.svg";
import FolderCreateModal from "./FolderCreateModal";


interface WorkspaceAddProps {
    rootFolder: BookmarkTreeNode,
    getCurrentWorkspace: Function,
    refreshWorkspace: Function,
}

const WorkspaceAdd = (props: WorkspaceAddProps): JSX.Element => {
    const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);

    const handleCreateWorkspace = (title: string) => {
        chrome.bookmarks.create(
            {
                title: title,
                parentId: props.rootFolder.id,
            },
            (newWorkspace) => {
                props.getCurrentWorkspace(newWorkspace);
                props.refreshWorkspace();
                setIsNewWorkspaceModalOpen(false);
            }
        )
    };

    return (
        <div id="add-btns-container" className="mt-20 flex justify-center items-center">
            <img src={addIcon} onClick={() => setIsNewWorkspaceModalOpen(true)} className="w-24 h-24" />

            <FolderCreateModal isOpen={isNewWorkspaceModalOpen} onClose={() => setIsNewWorkspaceModalOpen(false)} onCreate={handleCreateWorkspace} />
        </div>

    );
}

export default WorkspaceAdd;