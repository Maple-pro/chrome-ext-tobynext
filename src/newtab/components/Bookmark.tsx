import React, { JSX } from "react";
import deleteBookmarkIcon from "@assets/close-tab.svg";
import editBookmarkIcon from "@assets/edit-bookmark.svg";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface BookmarkProps {
    bookmark: BookmarkTreeNode,
}

const Bookmark = (props: BookmarkProps): JSX.Element => {
    return (
        <div 
            id="bookmark-container" 
            onClick={() => window.open(props.bookmark.url, "_blank")}
            className="group w-full h-40 my-10 px-20 py-10 rounded-md border-1 border-solid border-[#DDDDF5] shadow-sm shadow-[#DDDDF5] flex flex-row items-center justify-between"
        >
            <div id="bookmark-title" className="truncate text-[14px] basis-1/2 shrink-1 grow-0 pr-20">
                {props.bookmark.title}
            </div>
            <div id="bookmark-url" className="truncate text-[12px] text-[#474759] basis-1/2 shrink-4 grow-0">
                {props.bookmark.url}
            </div>
            <div id="bookmark-button-group" className="flex-none flex flex-row invisible group-hover:visible">
                <div id="edit-bookmark-button" className="w-16 h-16 ml-10 flex justify-center items-center">
                    <img src={editBookmarkIcon} />
                </div>
                <div id="delete-bookmark-button" className="w-16 h-16 ml-10 flex justify-center items-center">
                    <img src={deleteBookmarkIcon} />
                </div>
            </div>
        </div>
    )
}

export default Bookmark;