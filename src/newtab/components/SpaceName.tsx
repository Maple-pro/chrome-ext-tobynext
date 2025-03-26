import React, { JSX } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpaceNameProps {
    space: BookmarkTreeNode | undefined,
    collections: BookmarkTreeNode[],
}

const SpaceName = (props: SpaceNameProps): JSX.Element => {
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
                <div id="button-text" className="px-10 py-5 ">
                    + ADD COLLECTION 
                </div>
            </div>
        </div>
    );
}

export default SpaceName;