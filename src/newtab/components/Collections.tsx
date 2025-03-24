import React, { JSX, useEffect, useState } from "react";
import fetchSubFolder from "../utils/fetchSubFolder";
import Collection from "./Collection";

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface SpacesProps {
    space: BookmarkTreeNode | undefined,
}

const Collections = (props: SpacesProps): JSX.Element => {
    const [collections, setCollections] = useState<BookmarkTreeNode[]>([]);

    useEffect(() => {
        if (props.space) {
            fetchSubFolder(props.space, setCollections);
        } else {
            setCollections([]);
        }
    }, [props.space]);

    return (
        <div id="collection-panel" className="w-full grow-0 flex flex-col overflow-y-auto">
            {collections.map(collection => (
                <Collection collection={collection} />
            ))}
        </div>
    );
}

export default Collections;