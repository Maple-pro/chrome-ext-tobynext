import React, { JSX, useState } from "react";
import addIcon from "@assets/add-workspace.svg";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface WorkspaceAddProps {
    rootFolder: BookmarkTreeNode,
    getCurrentWorkspace: Function,
    refreshWorkspace: Function,
}

const WorkspaceAdd = (props: WorkspaceAddProps): JSX.Element => {
    const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
    const [newWorkspaceTitle, setNewWorkspaceTitle] = useState("");

    const handleCreateWorkspace = () => {
        if (!newWorkspaceTitle.trim()) {
            return;
        }
        
        chrome.bookmarks.create(
            {
                title: newWorkspaceTitle,
                parentId: props.rootFolder.id,
            },
            (newWorkspace) => {
                props.getCurrentWorkspace(newWorkspace);
                props.refreshWorkspace();
                setIsNewWorkspaceModalOpen(false);
                setNewWorkspaceTitle("");
            }
        )
    };

    return (
        <div id="add-btns-container" className="mt-20 flex justify-center items-center">
            <img src={addIcon} onClick={() => setIsNewWorkspaceModalOpen(true)} className="w-24 h-24" />

            {isNewWorkspaceModalOpen && (
                <div id="new-workspace-dialog-bg" className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
                    <div id="new-workspace-dialog" className="absolute top-100 left-1/2 -translate-x-1/2 bg-[#FAFAFA] opacity-100 rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-300">
                        <div id="new-workspace-dialog-title" className="text-[18px] font-bold mb-15">
                            Create New Workspace
                        </div>
                        <div id="new-workspace-dialog-input-hint" className="text-[14px] mb-10">
                            Title
                        </div>
                        <input
                            type="text"
                            value={newWorkspaceTitle}
                            onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                            autoFocus
                            className="w-full text-[14px] border border-gray-300 rounded-md h-25 flex-0 px-4 py-10 focus:outline-none focus:ring-2 focus:ring-[#3c5cce]"
                            placeholder="Enter workspace title"
                        />
                        <div id="new-workspace-dialog-buttons" className="w-full flex flex-row items-center justify-around mt-15">
                            <div
                                id="new-workspace-dialog-cancel"
                                onClick={() => setIsNewWorkspaceModalOpen(false)}
                                className="flex items-center justify-center basis-1/2 px-10 py-5 mr-5 rounded-md cursor-pointer text-[#3c5cce] font-bold"
                            >
                                CANCEL
                            </div>
                            <div
                                id="new-workspace-dialog-confirm"
                                onClick={handleCreateWorkspace}
                                className={`flex items-center justify-center basis-1/2 px-10 py-5
                                    rounded-md cursor-pointer font-bold outline-1
                                    ${newWorkspaceTitle ? "bg-[#3c5cce] text-[#FAFAFA] outline-0" : "text-gray-300 outline-gray-300"}  `}
                            >
                                CREATE
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default WorkspaceAdd;