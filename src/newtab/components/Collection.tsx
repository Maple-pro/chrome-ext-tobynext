import React, { JSX, useEffect, useState } from "react";
import fetchSubBookmark from "../utils/fetchSubBookmark";
import Bookmark from "./Bookmark";
import expandCollectionIcon from "@assets/expand-window.svg";
import openCollectionIcon from "@assets/open-collection.svg";
import moreIcon from "@assets/more.svg";
import deleteCollectionIcon from "@assets/delete-collection.svg";
import moveToIcon from "@assets/move-to.svg";
import MoveCollectionModal from "./MoveCollectionModal";
import { useNewTabContext } from "../context/NewTabContext";


interface CollectionProps {
    collection: BookmarkTreeNode,
}

const Collection = (props: CollectionProps): JSX.Element => {
    const {refreshCollections} = useNewTabContext();

    const [bookmarks, setBookmarks] = useState<BookmarkTreeNode[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(props.collection.title);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    // get bookmarks
    useEffect(() => {
        fetchSubBookmark(props.collection, setBookmarks);
    }, [props.collection]);

    const handleExpandToggle = () => {
        setIsExpanded(prevState => !prevState);
    };

    const handleOpenCollection = () => {
        const urls = bookmarks.map(bookmarks => bookmarks.url).filter((url): url is string => !!url);
        if (urls.length > 0) {
            chrome.windows.create({ 
                focused: true,
                url: urls 
            });
        }
    };
    
    const handleDeleteCollection = async () => {
        await chrome.bookmarks.removeTree(props.collection.id);
        refreshCollections();
    }

    const handleCollectionTitleClick = () => {
        setIsEditing(true);
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            chrome.bookmarks.update(props.collection.id, {title: newTitle}, () => {
                setIsEditing(false);
                props.collection.title = newTitle;
            });
        } else if (event.key === "Escape") {
            setIsEditing(false);
            setNewTitle(props.collection.title);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const tabData = event.dataTransfer.getData("application/json");
        if (tabData) {
            const tab: chrome.tabs.Tab = JSON.parse(tabData);

            chrome.bookmarks.create({
                parentId: props.collection.id,
                title: tab.title || "New Tab",
                url: tab.url,
            }, () => {
                refreshCollections();
            });
        }
    };

    return (
        <div 
            id="collection-container" 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full grow-0 px-30 py-24 flex flex-col
                ${isDragOver ? "border-1 border-solid border-toby-blue" : "border-b-1 border-solid border-toby-outline-gray"}`}
        >
            <div id="collection-title-container" className="flex flex-row items-center justify-between">
                <div id="collection-title-group" className="flex flex-row items-center">
                    <div id="collection-title" className="text-[18px] flex-1 mr-15">
                        {isEditing ? (
                            <input
                                type="text"
                                value={newTitle}
                                onChange={handleTitleChange}
                                onKeyDown={handleKeyPress}
                                autoFocus
                                className="text-[18px] border-b-1 border-black outline-none w-full"
                            />
                        ) : (
                            <span onClick={handleCollectionTitleClick} className="w-full">{props.collection.title}</span>
                        )}
                    </div>
                    {isEditing || (
                        <div
                            id="collection-expand-icon" 
                            className={`w-18 h-18 flex justify-center items-center cursor-pointer transition-transform duration-300 ${isExpanded ? '' : 'rotate-[-90deg]'}`}
                            onClick={handleExpandToggle}
                        >
                            <img src={expandCollectionIcon} />
                        </div>

                    )}
                </div>
                <div id="collection-button-group" className="flex flex-row">
                    <div 
                        id="move-to-icon"
                        onClick={() => setIsMoveModalOpen(true)}
                        className="w-18 h-18 mx-10 flex justify-center items-center cursor-pointer"
                    >
                        <img src={moveToIcon} />
                    </div>
                    <div 
                        id="open-collection-icon" 
                        onClick={handleOpenCollection}
                        className="w-18 h-18 mx-10 flex justify-center items-center cursor-pointer"
                    >
                        <img src={openCollectionIcon} />
                    </div> 
                    <div id="delete-collection-icon" onClick={handleDeleteCollection} className="w-18 h-18 mx-10 flex justify-center items-center cursor-pointer">
                        <img src={deleteCollectionIcon} />
                    </div>
                    <div id="more-operation-icon" className="w-18 h-18 mx-10 flex justify-center items-center cursor-pointer">
                        <img src={moreIcon} />
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div id="collection-items-container" className="pt-20">
                    {bookmarks.map(bookmark => (
                        <Bookmark bookmark={bookmark} />
                    ))}
                </div>
            )}
            <MoveCollectionModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                collection={props.collection}
            />
        </div>
    );
}

export default Collection;