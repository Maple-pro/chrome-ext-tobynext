import React, { JSX } from "react";
import defaultFavicon from "@assets/default-fav-icon.svg";
import closeIcon from "@assets/close-tab.svg";

type ChromeTab = chrome.tabs.Tab;

interface TabProps {
    tab: ChromeTab,
}

const Tab = (props: TabProps): JSX.Element => {
    const handleTabClick = () => {
        if (props.tab.windowId) {
            chrome.windows.update(props.tab.windowId, {focused: true}, () => {
                if (props.tab.id) {
                    chrome.tabs.update(props.tab.id, {active: true});
                }
            });
        }
    };

    const handleCloseTab = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (props.tab.id) {
            chrome.tabs.remove(props.tab.id);
        }
    };

    return (
        <div
            id="tab" 
            onClick={handleTabClick}
            className="group w-full h-35 my-5 py-5 px-10 flex flex-row items-center rounded-sm border-1 border-solid border-[#DDDDF5] shadow-sm shadow-[#DDDDF5] cursor-pointer"
        >
            <div id="tab-icon" className="flex-none w-15 h-15 mr-10 flex items-center justify-center">
                <img 
                    src={props.tab.favIconUrl ? props.tab.favIconUrl : defaultFavicon} 
                    onError={e => {
                        e.currentTarget.src = defaultFavicon;
                    }}
                    className="w-full h-full object-contain" 
                /> 
            </div>
            <div id="tab-title" className="text-[14px] truncate">
                {props.tab.title}
            </div>
            <div id="tab-close-button" onClick={handleCloseTab} className="flex-none ml-auto w-15 h-15 hidden group-hover:flex items-center justify-center">
                <img src={closeIcon} className="w-full h-full" />
            </div>
        </div>
    );
}

export default Tab;