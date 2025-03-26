import React, { JSX, useEffect, useState } from "react";
import findRootFolder from "./utils/findRootFolder";
import Workspaces from "./components/Workspaces";
import WorkspaceAdd from "./components/WorkspaceAdd";
import WorkspaceName from "./components/WorkspaceName";
import Search from "./components/Search";
import Spaces from "./components/Spaces";
import SpaceName from "./components/SpaceName";
import fetchSubFolder from "./utils/fetchSubFolder";
import Collections from "./components/Collections";
import TabName from "./components/TabName";
import Windows from "./components/Windows";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export default function NewTab(): JSX.Element {
    const [rootFolder, setRootFolder] = useState<BookmarkTreeNode | undefined>();
    const [currentWorkspace, setCurrentWorkspace] = useState<BookmarkTreeNode | undefined>();
    const [currentSpace, setCurrentSpace] = useState<BookmarkTreeNode | undefined>();
    const [collections, setCollections] = useState<BookmarkTreeNode[]>([]);
    const [forceUpdateCollections, setForceUpdateCollections] = useState(0);

    const refreshCollections = () => {
        setForceUpdateCollections(prev => prev + 1);
    };

    const getCurrentWorkspace = (currentWorkspace: BookmarkTreeNode) => {
        setCurrentWorkspace(currentWorkspace);
    }

    const getCurrentSpace = (currentSpace: BookmarkTreeNode) => {
        setCurrentSpace(currentSpace);
    }

    useEffect(() => {
        const fetchRootFolder = async () => {
            const folder = await findRootFolder();
            setRootFolder(folder);
        };

        fetchRootFolder();
    }, []);

    useEffect(() => {
        if (currentSpace) {
            fetchSubFolder(currentSpace, setCollections);
        } else {
            setCollections([]);
        }
    }, [currentSpace]);

    return (
        <div id="my-ext" data-theme="light">
            <div id="main-container" className="h-screen w-screen flex bg-[#FAFAFA]">
                <div id="navigation-panel-group" className="h-full flex-none basis-290 flex">
                    <div id="workspace-panel" className="h-full flex-none basis-70 py-16 flex flex-col">
                        {rootFolder && <Workspaces folder={rootFolder} getCurrentWorkspace={getCurrentWorkspace}/>}
                        <WorkspaceAdd />
                    </div>
                    <div id="space-panel" className="h-full flex-none basis-220 border-x-1 border-solid border-[#DDDDF5] flex flex-col">
                        {currentSpace && <WorkspaceName workspace={currentSpace} />}
                        <Search />
                        {currentWorkspace && <Spaces workspace={currentWorkspace} getCurrentSpace={getCurrentSpace} />}
                    </div>
                </div>
                <div id="collection-container" className="h-full grow shrink basis-auto border-r-1 border-solid border-[#DDDDF5] flex flex-col max-w-[calc(100vw-510px)]">
                    <SpaceName space={currentSpace} collections={collections} />
                    <Collections space={currentSpace} forceUpdate={forceUpdateCollections} refreshCollections={refreshCollections} />
                </div>
                <div id="tab-container" className="h-full flex-none basis-220 max-w-220 flex flex-col">
                    <TabName />
                    <Windows refreshCollections={refreshCollections} currentSpace={currentSpace} />
                </div>
            </div>
        </div>
    );
}
