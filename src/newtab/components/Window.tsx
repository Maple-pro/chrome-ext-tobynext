import React, { JSX, useEffect, useState } from "react";
import fetchAllTabsByWindow from "../utils/fetchAllTabsByWindow";
import Tab from "./Tab";

type ChromeWindow = chrome.windows.Window;
type ChromeTab = chrome.tabs.Tab;

interface WindowProps {
    window: ChromeWindow,
    index: number,
}

const Window = (props: WindowProps): JSX.Element => {
    const [tabs, setTabs] = useState<ChromeTab[]>([]);

    useEffect(() => {
        if (props.window && props.window.id) {
            fetchAllTabsByWindow(props.window.id, setTabs);
        }
    }, []);

    return (
        <div id="window-container" className="w-full my-5 py-20 px-12 flex-none flex flex-col items-center rounded-sm border-1 border-solid border-[#DDDDF5] shadow-xs shadow-[#DDDDF5]">
            <div id="window-title-group" className="w-full flex flex-row items-center justify-start">
                <div id="window-title" className="mb-5 text-[12px] text-[#474759]">
                    Window {props.index}
                </div>
            </div>
            <div id="tab-group" className="w-full flex flex-col items-center">
                {tabs.map(tab => {
                    if (!tab.url || !tab.url.startsWith("chrome://")) {
                        return (
                            <Tab tab={tab} />
                        );
                    }
                })}
            </div>
        </div>
    );
}

export default Window;