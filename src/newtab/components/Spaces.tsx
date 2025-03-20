import React, { JSX, useEffect, useState } from "react";
import addBlueIcon from "@assets/add-blue.svg";
import folderIcon from "@assets/folder.svg";
import folderBlueIcon from '@assets/folder-blue.svg';
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
    }, []);

    useEffect(() => {
        if (spaces.length != 0) {
            setCurrentSpace(spaces[0]);
            console.log("Current space: " + spaces[0].title);
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
                    <img src={addBlueIcon} className="w-15 h-15" />
                </div>
            </div>
            <div id="spaces-container" className="flex flex-col pt-15">
                {spaces.map(space => currentSpace && space.id === currentSpace.id ? (
                    <div id={"space-" + space.title} className="w-full h-25 mb-5 flex items-center justify-start">
                        <div id="space-icon" className="mr-10">
                            <img src={folderBlueIcon} className="w-15 h-15" />
                        </div>
                        <div id="space-title" className="text-[14px] font-bold text-[#3c5cce]">
                            {space.title}
                        </div>
                    </div>
                ) : (
                    <div id={"space-" + space.title} className="w-full h-25 mb-5 flex items-center justify-start">
                        <div id="space-icon" className="mr-10">
                            <img src={folderIcon} className="w-15 h-15" />
                        </div>
                        <div id="space-title" className="text-[14px]">
                            {space.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Spaces;