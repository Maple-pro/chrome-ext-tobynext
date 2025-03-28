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
import { useStoredState } from "./hooks/useStoredState";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export default function NewTab(): JSX.Element {
    const [rootFolder, setRootFolder] = useState<BookmarkTreeNode | undefined>();
    const [currentWorkspace, setCurrentWorkspace] = useStoredState<BookmarkTreeNode | undefined>("currentWorkspace");
    const [currentSpace, setCurrentSpace] = useStoredState<BookmarkTreeNode | undefined>("currentSpace");
    const [collections, setCollections] = useState<BookmarkTreeNode[]>([]);
    const [forceUpdateCollections, setForceUpdateCollections] = useState(0);
    const [forceUpdateSpaces, setForceUpdateSpaces] = useState(0);
    const [forceUpdateWorkspaces, setForceUpdateWorkspaces] = useState(0);


    // force refresh collections
    const refreshCollections = () => {
        setForceUpdateCollections(prev => prev + 1);
    };

    // force refresh spaces
    const refreshSpaces = () => {
        setForceUpdateSpaces(prev => prev + 1);
    };

    // force refresh workspaces
    const refreshWorkspace = () => {
        setForceUpdateWorkspaces(prev => prev + 1);
    };

    const getCurrentWorkspace = (currentWorkspace: BookmarkTreeNode) => {
        setCurrentWorkspace(currentWorkspace);
    }

    const getCurrentSpace = (currentSpace: BookmarkTreeNode) => {
        setCurrentSpace(currentSpace);
    }

    // get rootFolder
    useEffect(() => {
        const fetchRootFolder = async () => {
            const folder = await findRootFolder();
            setRootFolder(folder);
        };

        fetchRootFolder();
    }, []);

    // get collections
    useEffect(() => {
        if (currentSpace) {
            fetchSubFolder(currentSpace, setCollections);
        } else {
            setCollections([]);
        }
    }, [currentSpace]);

    return (
        <div id="my-ext" data-theme="light">
            <div id="main-container" className="h-screen w-screen flex bg-toby-bg-gray">
                <div id="navigation-panel-group" className="h-full flex-none basis-290 flex">
                    <div id="workspace-panel" className="h-full flex-none basis-70 py-16 flex flex-col">
                        {rootFolder && <Workspaces rootFolder={rootFolder} getCurrentWorkspace={getCurrentWorkspace} forceUpdate={forceUpdateWorkspaces} currentWorkspace={currentWorkspace} />}
                        {rootFolder && <WorkspaceAdd rootFolder={rootFolder} getCurrentWorkspace={getCurrentWorkspace} refreshWorkspace={refreshWorkspace} />}
                    </div>
                    <div id="space-panel" className="h-full flex-none basis-220 border-x-1 border-solid border-toby-outline-gray flex flex-col">
                        {currentWorkspace && <WorkspaceName workspace={currentWorkspace} />}
                        <Search />
                        {currentWorkspace && <Spaces currentWorkspace={currentWorkspace} getCurrentSpace={getCurrentSpace} forceUpdate={forceUpdateSpaces} refreshSpaces={refreshSpaces} currentSpace={currentSpace}/>}
                    </div>
                </div>
                <div id="collection-container" className="h-full grow shrink basis-auto border-r-1 border-solid border-toby-outline-gray flex flex-col max-w-[calc(100vw-510px)]">
                    <SpaceName space={currentSpace} collections={collections} refreshCollections={refreshCollections} />
                    <Collections space={currentSpace} forceUpdate={forceUpdateCollections} refreshCollections={refreshCollections} rootFolder={rootFolder!} getCurrentWorkspace={getCurrentWorkspace} getCurrentSpace={getCurrentSpace} />
                </div>
                <div id="tab-container" className="h-full flex-none basis-220 max-w-220 flex flex-col">
                    <TabName />
                    <Windows refreshCollections={refreshCollections} currentSpace={currentSpace} />
                </div>
            </div>
        </div>
    );
}
