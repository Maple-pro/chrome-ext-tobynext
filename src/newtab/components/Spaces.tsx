import React, { JSX, useEffect, useState } from "react";
import addSpaceIcon from "@assets/add-space.svg";
import folderIcon from "@assets/folder.svg";
import selectedFolderIcon from '@assets/folder-selected.svg';
import fetchSubFolder from "../utils/fetchSubFolder";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpacesProps {
    workspace: BookmarkTreeNode,
    getCurrentSpace: Function,
}

const Spaces = (props: SpacesProps): JSX.Element => {
    const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
    const [currentSpace, setCurrentSpace] = useState<BookmarkTreeNode>();
    const workspace = props.workspace;

    useEffect(() => {
        fetchSubFolder(workspace, setSpaces);
    }, [workspace]);

    useEffect(() => {
        if (spaces.length != 0) {
            setCurrentSpace(spaces[0]);
            console.log("Current space: " + spaces[0].title);
        } else {
            setCurrentSpace(undefined);
            console.log("No current space");
        }
    }, [spaces]);

    useEffect(() => {
        props.getCurrentSpace(currentSpace);
    }, [currentSpace])

    return (
        <div id="space-container" className="flex flex-col px-12 py-16 overflow-y-auto no-scrollbar">
            <div id="space-title-container" className="flex flex-row justify-between">
                <div id="title" className="text-[12px] font-bold">
                    SPACES
                </div>
                <div id="add-space">
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
        </div>
    );
}

export default Spaces;