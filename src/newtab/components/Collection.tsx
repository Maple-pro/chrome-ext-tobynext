import React, { JSX, useEffect, useState } from "react";
import fetchSubBookmark from "../utils/fetchSubBookmark";
import Bookmark from "./Bookmark";

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
            <div id="collection-title" className="text-[18px]">
                {props.collection.title}
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