import React, { JSX, useState } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpaceNameProps {
    space: BookmarkTreeNode | undefined,
    collections: BookmarkTreeNode[],
    refreshCollections: Function,
}

const SpaceName = (props: SpaceNameProps): JSX.Element => {
    const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
    const [newCollectionTitle, setNewCollectionTitle] = useState("");

    const handleCreateCollection = () => {
        if (!newCollectionTitle.trim() || !props.space) {
            return;
        }

        chrome.bookmarks.create(
            {
                title: newCollectionTitle,
                parentId: props.space.id,
            },
            () => {
                props.refreshCollections();
                setIsNewCollectionModalOpen(false);
                setNewCollectionTitle("");
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

            {isNewCollectionModalOpen && (
                <div id="new-collection-dialog-bg" className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
                    <div id="new-collection-dialog" className="absolute top-100 left-1/2 -translate-x-1/2 bg-[#FAFAFA] opacity-100 rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-300">
                        <div id="new-collection-dialog-title" className="text-[18px] font-bold mb-15">
                            Create New Collection
                        </div>
                        <div id="new-collection-dialog-input-hint" className="text-[14px] mb-10">
                            Title
                        </div>
                        <input
                            type="text"
                            value={newCollectionTitle}
                            onChange={(e) => setNewCollectionTitle(e.target.value)}
                            autoFocus
                            className="w-full text-[14px] border border-gray-300 rounded-md h-25 flex-0 px-4 py-10 focus:outline-none focus:ring-2 focus:ring-[#3c5cce]"
                            placeholder="Enter collection title"
                        />
                        <div id="new-collection-dialog-buttons" className="w-full flex flex-row items-center justify-around mt-15">
                            <div
                                id="new-collection-dialog-cancel"
                                onClick={() => setIsNewCollectionModalOpen(false)}
                                className="flex items-center justify-center basis-1/2 px-10 py-5 mr-5 rounded-md cursor-pointer text-[#3c5cce] font-bold"
                            >
                                CANCEL
                            </div>
                            <div
                                id="new-collection-dialog-confirm"
                                onClick={handleCreateCollection}
                                className={`flex items-center justify-center basis-1/2 px-10 py-5
                                    rounded-md cursor-pointer font-bold outline-1
                                    ${newCollectionTitle ? "bg-[#3c5cce] text-[#FAFAFA] outline-0" : "text-gray-300 outline-gray-300"}  `}
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

export default SpaceName;