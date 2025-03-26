import React, { JSX, useEffect, useState } from "react";
import fetchAllWindows from "../utils/fetchAllWindows";
import Window from "./Window";

type ChromeWindow = chrome.windows.Window;
type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface WindowsProps {
    refreshCollections: Function,
    currentSpace: BookmarkTreeNode | undefined,
};

const Windows = (props: WindowsProps): JSX.Element => {
    const [windows, setWindows] = useState<ChromeWindow[]>([]);

    useEffect(() => {
        fetchAllWindows(setWindows);

        const handleTabChange = () => {
            fetchAllWindows(setWindows);
        };

        chrome.tabs.onUpdated.addListener(handleTabChange);
        chrome.tabs.onRemoved.addListener(handleTabChange);
        chrome.tabs.onCreated.addListener(handleTabChange);
        chrome.windows.onRemoved.addListener(handleTabChange);
        chrome.windows.onCreated.addListener(handleTabChange);

        return () => {
            chrome.tabs.onUpdated.removeListener(handleTabChange);
            chrome.tabs.onRemoved.removeListener(handleTabChange);
            chrome.tabs.onCreated.removeListener(handleTabChange);
            chrome.windows.onRemoved.removeListener(handleTabChange);
            chrome.windows.onCreated.removeListener(handleTabChange);
        };
    }, []);

    return (
        <div id="windows-panel" className="w-full flex flex-col p-10 items-center overflow-y-auto no-scrollbar">
            {windows.map((window, index) => (
                <Window window={window} index={index + 1} refreshCollections={props.refreshCollections} currentSpace={props.currentSpace} />
            ))}
        </div>
    );
}

export default Windows;