import React, { JSX, useEffect, useState } from "react";
import fetchAllTabsByWindow from "../utils/fetchAllTabsByWindow";
import Tab from "./Tab";
import expandWindowIcon from "@assets/expand-window.svg";
import saveWindowIcon from "@assets/save-window.svg";
import closeWindowIcon from "@assets/close-window.svg";
import { useNewTabContext } from "../context/NewTabContext";


interface WindowProps {
    window: ChromeWindow,
    index: number,
}

const Window = (props: WindowProps): JSX.Element => {
    const [tabs, setTabs] = useState<ChromeTab[]>([]);
    const [filteredTabs, setFilteredTabs] = useState<ChromeTab[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const {refreshCollections, currentSpace} = useNewTabContext();

    useEffect(() => {
        if (props.window && props.window.id) {
            fetchAllTabsByWindow(props.window.id, setTabs);
        }
    }, [props.window]);

    useEffect(() => {
        setFilteredTabs(tabs.filter(tab => !tab.url || !tab.url.startsWith("chrome://")));
    }, [tabs]);

    const handleExpandToggel = () => {
        setIsExpanded(prevState => !prevState);
    };

    const handleCloseWindow = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (props.window.id) {
            chrome.windows.remove(props.window.id);
        }
    };

    const generateSavedCollectionTitle = () => {
        const date = new Date();
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };

        return date.toLocaleString("en-US", options);
    };

    const handleSaveWindow = async (event: React.MouseEvent) => {
        if (!currentSpace || !currentSpace.id) {
            console.log("No current space, cannot save session");
            return;
        }
        event.stopPropagation();
        const newCollection = await chrome.bookmarks.create({
            parentId: currentSpace.id,
            title: generateSavedCollectionTitle(),
            index: 0,
        });

        for (const tab of filteredTabs) {
            if (tab.url) {
                await chrome.bookmarks.create({
                    parentId: newCollection.id,
                    title: tab.title || "New Tab",
                    url: tab.url,
                });
            }
        }

        refreshCollections();
    };

    return (
        <div id="window-container" className="w-full my-5 py-10 px-12 flex-none flex flex-col items-center rounded-sm border-1 border-solid border-toby-outline-gray shadow-xs shadow-toby-outline-gray">
            <div id="window-title-group" className="w-full mb-5 flex flex-row items-center justify-between">
                <div id="window-title-group" className="flex flex-row items-center">
                    <div id="window-title" className="text-[12px] text-[#474759] mr-5">
                        Window {props.index}
                    </div>
                    <div
                        id="window-expand-button" 
                        className={`flex-none w-12 h-12 flex justify-center items-center cursor-pointer transition-transform duration-300 ${isExpanded ? '' : 'rotate-[-90deg]'}`}
                        onClick={handleExpandToggel}
                    >
                        <img src={expandWindowIcon} />
                    </div>
                </div>
                <div id="window-buttons-group" className="flex flex-row items-center">
                    <div 
                        id="save-window-button" 
                        onClick={handleSaveWindow}
                        className="flex-none w-12 h-12 mx-5 flex justify-center items-center cursor-pointer"
                    >
                        <img src={saveWindowIcon} />
                    </div>
                    <div 
                        id="close-window-button" 
                        onClick={handleCloseWindow} 
                        className="flex-none w-12 h-12 mx-5 flex justify-center items-center cursor-pointer"
                    >
                        <img src={closeWindowIcon} />
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div id="tab-group" className="w-full flex flex-col items-center">
                    {filteredTabs.map(tab =>
                        <Tab tab={tab} />
                    )}
                </div>
            )}
        </div>
    );
}

export default Window;