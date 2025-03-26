import React, { JSX, useEffect, useState } from "react";
import fetchSubBookmark from "../utils/fetchSubBookmark";
import Bookmark from "./Bookmark";
import expandCollectionIcon from "@assets/expand-window.svg";
import openCollectionIcon from "@assets/open-collection.svg";
import moreIcon from "@assets/more.svg";
import deleteCollectionIcon from "@assets/delete-collection.svg";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface CollectionProps {
    collection: BookmarkTreeNode,
    refreshCollections: Function,
}

const Collection = (props: CollectionProps): JSX.Element => {
    const [bookmarks, setBookmarks] = useState<BookmarkTreeNode[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(props.collection.title);

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
        props.refreshCollections();
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

    return (
        <div id="collection-container" className="w-full grow-0 px-30 py-24 border-b-1 border-solid border-[#DDDDF5] flex flex-col">
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
        </div>
    );
}

export default Collection;