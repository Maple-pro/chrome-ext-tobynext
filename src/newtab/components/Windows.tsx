import React, { JSX, useEffect, useState } from "react";
import fetchAllWindows from "../utils/fetchAllWindows";
import Window from "./Window";

type ChromeWindow = chrome.windows.Window;

const Windows = (): JSX.Element => {
    const [windows, setWindows] = useState<ChromeWindow[]>([]);

    useEffect(() => {
        fetchAllWindows(setWindows);

        const handleTabChange = () => {
            fetchAllWindows(setWindows);
        };

        chrome.tabs.onUpdated.addListener(handleTabChange);
        chrome.tabs.onRemoved.addListener(handleTabChange);
        chrome.tabs.onCreated.addListener(handleTabChange);

        return () => {
            chrome.tabs.onUpdated.removeListener(handleTabChange);
            chrome.tabs.onRemoved.removeListener(handleTabChange);
            chrome.tabs.onCreated.removeListener(handleTabChange);
        };
    }, []);

    return (
        <div id="windows-panel" className="w-full flex flex-col p-10 items-center overflow-y-auto no-scrollbar">
            {windows.map((window, index) => (
                <Window window={window} index={index + 1} />
            ))}
        </div>
    );
}

export default Windows;