import React, { JSX } from "react";
import Workspaces from "./components/Workspaces";
import WorkspaceAdd from "./components/WorkspaceAdd";
import WorkspaceName from "./components/WorkspaceName";
import Search from "./components/Search";
import Spaces from "./components/Spaces";
import SpaceName from "./components/SpaceName";
import Collections from "./components/Collections";
import TabName from "./components/TabName";
import Windows from "./components/Windows";
import { NewTabProvider, useNewTabContext } from "./context/NewTabContext";
import TobyImport from "./components/TobyImport";


export default function NewTab(): JSX.Element {
    return (
        <NewTabProvider>
            <NewTabContent />
        </NewTabProvider>
    );
}

function NewTabContent(): JSX.Element {
    const {rootFolder, currentWorkspace} = useNewTabContext();
    
    return (
        <div id="my-ext" data-theme="light">
            <div id="main-container" className="h-screen w-screen flex bg-toby-bg-gray">
                <div id="navigation-panel-group" className="h-full flex-none basis-290 flex">
                    <div id="workspace-panel" className="h-full flex-none basis-70 py-16 flex flex-col">
                        {rootFolder && <Workspaces />}
                        {rootFolder && <WorkspaceAdd />}
                        <TobyImport />
                    </div>
                    <div id="space-panel" className="h-full flex-none basis-220 border-x-1 border-solid border-toby-outline-gray flex flex-col">
                        {currentWorkspace && <WorkspaceName />}
                        <Search />
                        {currentWorkspace && <Spaces />}
                    </div>
                </div>
                <div id="collection-container" className="h-full grow shrink basis-auto border-r-1 border-solid border-toby-outline-gray flex flex-col max-w-[calc(100vw-510px)]">
                    <SpaceName />
                    <Collections />
                </div>
                <div id="tab-container" className="h-full flex-none basis-220 max-w-220 flex flex-col">
                    <TabName />
                    <Windows />
                </div>
            </div>
        </div>
    );
}
