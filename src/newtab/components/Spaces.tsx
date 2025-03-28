import React, { JSX, useEffect, useState } from "react";
import addSpaceIcon from "@assets/add-space.svg";
import folderIcon from "@assets/folder.svg";
import selectedFolderIcon from '@assets/folder-selected.svg';
import fetchSubFolder from "../utils/fetchSubFolder";
import FolderCreateModal from "./FolderCreateModal";


interface SpacesProps {
    currentWorkspace: BookmarkTreeNode,
    getCurrentSpace: Function,
    forceUpdate: number,
    refreshSpaces: Function,
    currentSpace: BookmarkTreeNode | undefined,
}

const Spaces = (props: SpacesProps): JSX.Element => {
    const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
    const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);

    useEffect(() => {
        console.log("current space: " + props.currentSpace?.title);
    }, [props.currentSpace]);

    // get all spaces
    useEffect(() => {
        fetchSubFolder(props.currentWorkspace, setSpaces);
    }, [props.currentWorkspace, props.forceUpdate]);

    // When `props.currentSpace` is undefined or `props.currentSpace.parentId` is not `props.currentWorkspace`
    // use default spaces
    useEffect(() => {
        if (!props.currentSpace || props.currentSpace.parentId !== props.currentWorkspace.id) {
            // use default spaces
            if (spaces.length == 0) {
                props.getCurrentSpace(undefined);
                console.log("Use default space: undefined");
            } else {
                if (spaces[0].parentId === props.currentWorkspace.id) {
                    props.getCurrentSpace(spaces[0]);
                    console.log("Use default space: " + spaces[0].title);
                } else {
                    props.getCurrentSpace(undefined);
                    console.log("Use default space: undefined");
                }
            }
        }
    }, [spaces, props.currentSpace, props.getCurrentSpace])

    const handleCreateSpace = (title: string) => {
        chrome.bookmarks.create(
            {
                title: title,
                parentId: props.currentWorkspace.id,
            },
            (newSpace) => {
                props.getCurrentSpace(newSpace);
                props.refreshSpaces();
                setIsNewSpaceModalOpen(false);
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
                        onClick={() => props.getCurrentSpace(space)}
                        className="w-full h-25 mb-5 flex items-center justify-start cursor-pointer"
                    >
                        <div id="space-icon" className="mr-10">
                            <img src={props.currentSpace && space.id === props.currentSpace.id ? selectedFolderIcon : folderIcon} className="w-15 h-15" />
                        </div>
                        <div id="space-title" className={`text-[14px] ${props.currentSpace && space.id === props.currentSpace.id ? "font-bold text-toby-blue" : ""} `}>
                            {space.title}
                        </div>
                    </div>
                ))}
            </div>

            <FolderCreateModal isOpen={isNewSpaceModalOpen} onClose={() => setIsNewSpaceModalOpen(false)} onCreate={handleCreateSpace} />
        </div>
    );
}

export default Spaces;