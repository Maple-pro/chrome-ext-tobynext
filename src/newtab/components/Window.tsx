import React, { JSX, useEffect, useState } from "react";
import fetchAllTabsByWindow from "../utils/fetchAllTabsByWindow";
import Tab from "./Tab";
import expandWindowIcon from "@assets/expand-window.svg";
import saveWindowIcon from "@assets/save-window.svg";
import closeWindowIcon from "@assets/close-window.svg";

type ChromeWindow = chrome.windows.Window;
type ChromeTab = chrome.tabs.Tab;

interface WindowProps {
    window: ChromeWindow,
    index: number,
}

const Window = (props: WindowProps): JSX.Element => {
    const [tabs, setTabs] = useState<ChromeTab[]>([]);
    const [filteredTabs, setFilteredTabs] = useState<ChromeTab[]>([]);

    useEffect(() => {
        if (props.window && props.window.id) {
            fetchAllTabsByWindow(props.window.id, setTabs);
        }
    }, [props.window]);

    useEffect(() => {
        setFilteredTabs(tabs.filter(tab => !tab.url || !tab.url.startsWith("chrome://")));
    }, [tabs]);

    return (
        <div id="window-container" className="w-full my-5 py-10 px-12 flex-none flex flex-col items-center rounded-sm border-1 border-solid border-[#DDDDF5] shadow-xs shadow-[#DDDDF5]">
            <div id="window-title-group" className="w-full mb-5 flex flex-row items-center justify-between">
                <div id="window-title-group" className="flex flex-row items-center">
                    <div id="window-title" className="text-[12px] text-[#474759] mr-5">
                        Window {props.index}
                    </div>
                    <div id="window-expand-button" className="flex-none w-12 h-12 flex justify-center items-center">
                        <img src={expandWindowIcon} />
                    </div>
                </div>
                <div id="window-buttons-group" className="flex flex-row items-center">
                    <div id="save-window-button" className="flex-none w-12 h-12 mx-5 flex justify-center items-center">
                        <img src={saveWindowIcon} />
                    </div>
                    <div id="close-window-button" className="flex-none w-12 h-12 mx-5 flex justify-center items-center">
                        <img src={closeWindowIcon} />
                    </div>
                </div>
            </div>
            <div id="tab-group" className="w-full flex flex-col items-center">
                {filteredTabs.map(tab =>
                    <Tab tab={tab} />
                )}
            </div>
        </div>
    );
}

export default Window;