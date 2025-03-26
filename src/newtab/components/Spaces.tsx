import React, { JSX, useEffect, useState } from "react";
import addSpaceIcon from "@assets/add-space.svg";
import folderIcon from "@assets/folder.svg";
import selectedFolderIcon from '@assets/folder-selected.svg';
import fetchSubFolder from "../utils/fetchSubFolder";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpacesProps {
    workspace: BookmarkTreeNode,
    getCurrentSpace: Function,
    forceUpdate: number,
    refreshSpaces: Function,
    currentSpace: BookmarkTreeNode | undefined,
}

const Spaces = (props: SpacesProps): JSX.Element => {
    const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
    const [currentSpace, setCurrentSpace] = useState<BookmarkTreeNode>();

    const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
    const [newSpaceTitle, setNewSpaceTitle] = useState("");

    useEffect(() => {
        fetchSubFolder(props.workspace, setSpaces);
    }, [props.workspace, props.forceUpdate]);

    useEffect(() => {
        if (props.currentSpace && props.currentSpace.parentId === props.workspace.id) {
            setCurrentSpace(props.currentSpace)
        } else {
            if (spaces.length != 0) {
                setCurrentSpace(spaces[0]);
                console.log("Current space: " + spaces[0].title);
            } else {
                setCurrentSpace(undefined);
                console.log("No current space");
            }
        }
    }, [spaces]);

    useEffect(() => {
        props.getCurrentSpace(currentSpace);
    }, [currentSpace])

    const handleCreateSpace = () => {
        if (!newSpaceTitle.trim()) {
            return;
        }

        chrome.bookmarks.create(
            {
                title: newSpaceTitle,
                parentId: props.workspace.id,
            },
            (newSpace) => {
                props.getCurrentSpace(newSpace);
                props.refreshSpaces();
                setIsNewSpaceModalOpen(false);
                setNewSpaceTitle("");
            }
        )
    };

    return (
        <div id="space-container" className="flex flex-col px-12 py-16 overflow-y-auto no-scrollbar">
            <div id="space-title-container" className="flex flex-row justify-between">
                <div id="title" className="text-[12px] font-bold">
                    SPACES
                </div>
                <div id="add-space" onClick={() => setIsNewSpaceModalOpen(true)} className="cursor-pointer">
                    <img src={addSpaceIcon} className="w-15 h-15" />
                </div>
            </div>
            <div id="spaces-container" className="flex flex-col pt-15">
                {spaces.map(space => (
                    <div
                        id={"space-" + space.title}
                        onClick={() => setCurrentSpace(space)}
                        className="w-full h-25 mb-5 flex items-center justify-start cursor-pointer"
                    >
                        <div id="space-icon" className="mr-10">
                            <img src={currentSpace && space.id === currentSpace.id ? selectedFolderIcon : folderIcon} className="w-15 h-15" />
                        </div>
                        <div id="space-title" className={`text-[14px] ${currentSpace && space.id === currentSpace.id ? "font-bold text-[#3c5cce]" : ""} `}>
                            {space.title}
                        </div>
                    </div>
                ))}
            </div>

            {isNewSpaceModalOpen && (
                <div id="new-space-dialog-bg" className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
                    <div id="new-space-dialog" className="absolute top-100 left-1/2 -translate-x-1/2 bg-[#FAFAFA] opacity-100 rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-300">
                        <div id="new-space-dialog-title" className="text-[18px] font-bold mb-15">
                            Create New Space
                        </div>
                        <div id="new-space-dialog-input-hint" className="text-[14px] mb-10">
                            Title
                        </div>
                        <input
                            type="text"
                            value={newSpaceTitle}
                            onChange={(e) => setNewSpaceTitle(e.target.value)}
                            autoFocus
                            className="w-full text-[14px] border border-gray-300 rounded-md h-25 flex-0 px-4 py-10 focus:outline-none focus:ring-2 focus:ring-[#3c5cce]"
                            placeholder="Enter space title"
                        />
                        <div id="new-space-dialog-buttons" className="w-full flex flex-row items-center justify-around mt-15">
                            <div
                                id="new-space-dialog-cancel"
                                onClick={() => setIsNewSpaceModalOpen(false)}
                                className="flex items-center justify-center basis-1/2 px-10 py-5 mr-5 rounded-md cursor-pointer text-[#3c5cce] font-bold"
                            >
                                CANCEL
                            </div>
                            <div
                                id="new-space-dialog-confirm"
                                onClick={handleCreateSpace}
                                className={`flex items-center justify-center basis-1/2 px-10 py-5
                                    rounded-md cursor-pointer font-bold outline-1
                                    ${newSpaceTitle ? "bg-[#3c5cce] text-[#FAFAFA] outline-0" : "text-gray-300 outline-gray-300"}  `}
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

export default Spaces;