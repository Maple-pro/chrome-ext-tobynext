import React, { JSX, useState } from "react";
import FolderCreateModal from "../modals/FolderCreateModal";
import { useNewTabContext } from "../context/NewTabContext";


const SpaceName = (): JSX.Element => {
    const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
    const {currentSpace, collections, refresh} = useNewTabContext();

    const handleCreateCollection = (title: string) => {
        if (!currentSpace) {
            return;
        }

        chrome.bookmarks.create(
            {
                title: title,
                parentId: currentSpace.id,
                index: 0,
            },
            () => {
                refresh();
                setIsNewCollectionModalOpen(false);
            }
        )
    }

    return (
        <div id="space-name-panel" className="w-full h-50 flex-none flex items-center justify-between px-30 border-b-1 border-solid border-toby-outline-gray">
            <div id="space-name-container" className="flex flex-row items-center">
                <div id="space-name" className="text-[18px]">
                    {currentSpace ? currentSpace.title : ""}
                </div>
                <div id="collection-number" className={`ml-20 text-[12px] text-[#70708C] ${currentSpace ? "visible" : "invisible"}`}>
                    | {collections.length} collections
                </div>
            </div>
            <div id="add-collection-button" className="bg-toby-blue rounded-md text-toby-bg-gray flex items-center justify-center cursor-pointer">
                <div id="button-text" onClick={() => setIsNewCollectionModalOpen(true)} className="px-10 py-5 ">
                    + ADD COLLECTION 
                </div>
            </div>

            <FolderCreateModal hint="Create New Collection" isOpen={isNewCollectionModalOpen} onClose={() => setIsNewCollectionModalOpen(false)} onCreate={handleCreateCollection} />
        </div>
    );
}

export default SpaceName;