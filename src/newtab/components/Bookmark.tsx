import React, { JSX, useState } from "react";
import deleteBookmarkIcon from "@assets/close-tab.svg";
import editBookmarkIcon from "@assets/edit-bookmark.svg";
import defaultFavicon from "@assets/default-fav-icon.svg";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface BookmarkProps {
    bookmark: BookmarkTreeNode,
}

const Bookmark = (props: BookmarkProps): JSX.Element => {
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (props.bookmark.id) {
            chrome.bookmarks.remove(props.bookmark.id, () => {
                setIsDeleted(true);
            });
        }
    };

    if (isDeleted) return (<div />);

    const getFaviconUrl = (url: string) => {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}`;
    };

    return (
        <div 
            id="bookmark-container" 
            onClick={() => window.open(props.bookmark.url, "_blank")}
            className="group w-full h-40 my-10 px-20 py-10 rounded-md border-1 border-solid border-[#DDDDF5] shadow-sm shadow-[#DDDDF5] flex flex-row items-center justify-between cursor-pointer"
        >
            <div id="bookmark-favicon" className="flex-none w-16 h-16 flex justify-center items-center mr-10">
                <img
                    src={props.bookmark.url ? getFaviconUrl(props.bookmark.url) : defaultFavicon} 
                    onError={e => {
                        e.currentTarget.src = defaultFavicon;
                    }}
                    className="w-full h-full object-contain"
            />
            </div>
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
                <div id="delete-bookmark-button" onClick={handleDelete} className="w-16 h-16 ml-10 flex justify-center items-center">
                    <img src={deleteBookmarkIcon} />
                </div>
            </div>
        </div>
    )
}

export default Bookmark;