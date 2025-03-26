import React, { JSX, useState } from "react";
import FolderCreateModal from "./FolderCreateModal";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpaceNameProps {
    space: BookmarkTreeNode | undefined,
    collections: BookmarkTreeNode[],
    refreshCollections: Function,
}

const SpaceName = (props: SpaceNameProps): JSX.Element => {
    const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);

    const handleCreateCollection = (title: string) => {
        if (!props.space) {
            return;
        }

        chrome.bookmarks.create(
            {
                title: title,
                parentId: props.space.id,
                index: 0,
            },
            () => {
                props.refreshCollections();
                setIsNewCollectionModalOpen(false);
            }
        )
    }

    return (
        <div id="space-name-panel" className="w-full h-50 flex-none flex items-center justify-between px-30 border-b-1 border-solid border-[#DDDDF5]">
            <div id="space-name-container" className="flex flex-row items-center">
                <div id="space-name" className="text-[18px]">
                    {props.space ? props.space.title : ""}
                </div>
                <div id="collection-number" className={`ml-20 text-[12px] text-[#70708C] ${props.space ? "invisible" : "visible"}`}>
                    | {props.collections.length} collections
                </div>
            </div>
            <div id="add-collection-button" className="bg-[#3C5CCE] rounded-md text-[#FAFAFA] flex items-center justify-center cursor-pointer">
                <div id="button-text" onClick={() => setIsNewCollectionModalOpen(true)} className="px-10 py-5 ">
                    + ADD COLLECTION 
                </div>
            </div>

            <FolderCreateModal isOpen={isNewCollectionModalOpen} onClose={() => setIsNewCollectionModalOpen(false)} onCreate={handleCreateCollection} />
        </div>
    );
}

export default SpaceName;