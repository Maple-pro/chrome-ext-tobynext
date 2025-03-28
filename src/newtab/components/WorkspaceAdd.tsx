import React, { JSX, useState } from "react";
import addIcon from "@assets/add-workspace.svg";
import FolderCreateModal from "./FolderCreateModal";
import { useNewTabContext } from "../context/NewTabContext";


const WorkspaceAdd = (): JSX.Element => {
    const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
    const {rootFolder, setCurrentWorkspace, refreshWorkspaces} = useNewTabContext();

    const handleCreateWorkspace = (title: string) => {
        if (rootFolder) {
            chrome.bookmarks.create(
                {
                    title: title,
                    parentId: rootFolder.id,
                },
                (newWorkspace) => {
                    setCurrentWorkspace(newWorkspace);
                    refreshWorkspaces();
                    setIsNewWorkspaceModalOpen(false);
                }
            )
        }
    };

    return (
        <div id="add-btns-container" className="mt-20 flex justify-center items-center">
            <img src={addIcon} onClick={() => setIsNewWorkspaceModalOpen(true)} className="w-24 h-24" />

            <FolderCreateModal isOpen={isNewWorkspaceModalOpen} onClose={() => setIsNewWorkspaceModalOpen(false)} onCreate={handleCreateWorkspace} />
        </div>

    );
}

export default WorkspaceAdd;