import React, { JSX } from "react";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface BookmarkProps {
    bookmark: BookmarkTreeNode,
}

const Bookmark = (props: BookmarkProps): JSX.Element => {
    return (
        <div id="bookmark-container" className="w-full h-40 my-5 px-20 py-10 rounded-md border-1 border-solid border-[#DDDDF5] shadow-md shadow-[#DDDDF5] flex flex-row items-center justify-between">
            <div id="bookmark-title" className="truncate text-[14px] basis-1/2 shrink-1 grow-0 pr-20">
                {props.bookmark.title}
            </div>
            <div id="bookmark-url" className="truncate text-[12px] text-[#474759] basis-1/2 shrink-4 grow-0">
                {props.bookmark.url}
            </div>
        </div>
    )
}

export default Bookmark;