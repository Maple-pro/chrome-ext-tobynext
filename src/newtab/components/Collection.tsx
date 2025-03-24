import React, { JSX, useEffect, useState } from "react";
import fetchSubBookmark from "../utils/fetchSubBookmark";
import Bookmark from "./Bookmark";
import expandCollectionIcon from "@assets/expand-window.svg";
import openCollectionIcon from "@assets/open-collection.svg";
import saveSessionIcon from "@assets/save-window.svg";
import moreIcon from "@assets/more.svg";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface CollectionProps {
    collection: BookmarkTreeNode,
}

const Collection = (props: CollectionProps): JSX.Element => {
    const [bookmarks, setBookmarks] = useState<BookmarkTreeNode[]>([]);

    useEffect(() => {
        fetchSubBookmark(props.collection, setBookmarks);
    }, []);

    return (
        <div id="collection-container" className="w-full grow-0 px-30 py-24 border-b-1 border-solid border-[#DDDDF5] flex flex-col">
            <div id="collection-title-container" className="flex flex-row items-center justify-between">
                <div id="collection-title-group" className="flex flex-row items-center">
                    <div id="collection-title" className="text-[18px] mr-15">
                        {props.collection.title}
                    </div>
                    <div id="collection-expand-icon" className="w-18 h-18 flex justify-center items-center">
                        <img src={expandCollectionIcon} />
                    </div>
                </div>
                <div id="collection-button-group" className="flex flex-row">
                    <div id="open-collection-icon" className="w-18 h-18 mx-10 flex justify-center items-center">
                        <img src={openCollectionIcon} />
                    </div> 
                    <div id="save-session-icon" className="w-18 h-18 mx-10 flex justify-center items-center">
                        <img src={saveSessionIcon} />
                    </div>
                    <div id="more-operation-icon" className="w-18 h-18 mx-10 flex justify-center items-center">
                        <img src={moreIcon} />
                    </div>
                </div>
            </div>
            <div id="collection-items-container" className="pt-20">
                {bookmarks.map(bookmark => (
                    <Bookmark bookmark={bookmark} />
                ))}
            </div>
        </div>
    );
}

export default Collection;