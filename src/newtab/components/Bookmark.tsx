import React, { JSX, useState } from "react";
import deleteBookmarkIcon from "@assets/close-tab.svg";
import editBookmarkIcon from "@assets/edit-bookmark.svg";
import defaultFavicon from "@assets/default-fav-icon.svg";
import { useNewTabContext } from "../context/NewTabContext";


interface BookmarkProps {
    bookmark: BookmarkTreeNode,
}

const Bookmark = (props: BookmarkProps): JSX.Element => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const {refreshCollections, dragType, setDragType} = useNewTabContext();

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (props.bookmark.id) {
            chrome.bookmarks.remove(props.bookmark.id, () => {
                setIsDeleted(true);
            });
        }
    };

    const handleDragStart = (event: React.DragEvent) => {
        setIsDragging(true);
        event.dataTransfer.setData("type", "bookmark");
        event.dataTransfer.setData("application/json", JSON.stringify(props.bookmark));
        setDragType("bookmark");
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isDragOver && dragType === "bookmark") {
            setIsDragOver(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); 
        if (!isDragOver && dragType === "bookmark") {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            e.preventDefault();
            setIsDragOver(false);
        }
    };

    const handleDragEnd = () => {
        setIsDragOver(false);
        setIsDragging(false);
        setDragType("");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (dragType === "tab") {
            return;
        }

        e.stopPropagation();
        setIsDragOver(false);
        setIsDragging(false);
        const type = e.dataTransfer.getData("type");
        
        if (type === "bookmark") {
            const bookmarkData = e.dataTransfer.getData("application/json");
            if (bookmarkData) {
                const bookmark: BookmarkTreeNode = JSON.parse(bookmarkData);

                if (bookmark.id === props.bookmark.id) {
                    return;
                }

                chrome.bookmarks.move(bookmark.id, {
                    parentId: props.bookmark.parentId,
                    index: props.bookmark.index,
                }, () => {
                    refreshCollections();
                })
            }
        }
    };

    if (isDeleted) {
        return (<div />);
    }

    const getFaviconUrl = (url: string) => {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}`;
    };

    return (
        <div 
            id="bookmark-container" 
            onClick={() => window.open(props.bookmark.url, "_blank")}
            className={`group w-full h-40 my-10 px-20 py-10 rounded-md border-1 border-solid shadow-sm shadow-toby-outline-gray flex flex-row items-center justify-between cursor-pointer border-toby-outline-gray
                ${isDragOver ? "border-t-2 border-t-toby-blue": ""}
                ${isDragging ? "opacity-50": ""}`}
            draggable
            onDragStart={handleDragStart} 
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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