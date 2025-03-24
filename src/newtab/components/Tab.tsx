import React, { JSX } from "react";

type ChromeTab = chrome.tabs.Tab;

interface TabProps {
    tab: ChromeTab,
}

const Tab = (props: TabProps): JSX.Element => {
    return (
        <div id="tab" className="w-full h-35 my-5 py-5 px-10 flex flex-row items-center rounded-sm border-1 border-solid border-[#DDDDF5] shadow-sm shadow-[#DDDDF5]">
            <div id="tab-icon" className="flex-none w-15 h-15 mr-10 flex items-center justify-center">
                <img src={props.tab.favIconUrl} className="w-full h-full object-contain" /> 
            </div>
            <div id="tab-title" className="text-[14px] truncate">
                {props.tab.title}
            </div>

        </div>
    );
}

export default Tab;