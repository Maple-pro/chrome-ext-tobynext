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
    const workspaceAddComponent = <WorkspaceAdd />;
    const searchComponent = <Search />;
    const tabNameComponent = <TabName />;
    const windowsComponent = <Windows />;

    const [rootFolder, setRootFolder] = useState<BookmarkTreeNode | undefined>();
    const [workspacesComponent, setWorkspacesComponent] = useState<JSX.Element>();
    const [currentWorkspace, setCurrentWorkspace] = useState<BookmarkTreeNode | undefined>();
    const [workspaceNameComponent, setWorkspaceNameComponent] = useState<JSX.Element>();
    const [spacesComponent, setSpacesComponent] = useState<JSX.Element>();
    const [currentSpace, setCurrentSpace] = useState<BookmarkTreeNode | undefined>();
    const [spaceNameComponent, setSpaceNameComponent] = useState<JSX.Element>();
    const [collections, setCollections] = useState<BookmarkTreeNode[]>();
    const [collectionsComponent, setCollectionsComponent] = useState<JSX.Element>();

    const getCurrentWorkspace = (defaultWorkspace: BookmarkTreeNode) => {
        setCurrentWorkspace(defaultWorkspace);
    }

    const getCurrentSpace = (defaultSpace: BookmarkTreeNode) => {
        setCurrentSpace(defaultSpace);
    }

    useEffect(() => {
        const fetchRootFolder = async () => {
            const folder = await findRootFolder();
            setRootFolder(folder);
        };

        fetchRootFolder();
    }, []);

    useEffect(() => {
        if (rootFolder) {
            setWorkspacesComponent(<Workspaces folder={rootFolder} getCurrentWorkspace={getCurrentWorkspace} />);
        }
    }, [rootFolder]);

    useEffect(() => {
        const workspaceName = currentWorkspace ? currentWorkspace.title : "";
        setWorkspaceNameComponent(<WorkspaceName workspaceName={workspaceName} />);
    }, [currentWorkspace]);

    useEffect(() => {
        if (currentWorkspace) {
            setSpacesComponent(<Spaces workspace={currentWorkspace} getCurrentSpace={getCurrentSpace} />);
        }
    }, [currentWorkspace]);

    useEffect(() => {
        if (currentSpace) {
            console.log("Current space: " + currentSpace.title);
        } else {
            console.log("No current space");
        }
    }, [currentSpace]);

    useEffect(() => {
        if (currentSpace) {
            fetchSubFolder(currentSpace, setCollections);
        } else {
            setCollections([]);
        }
    }, [currentSpace]);

    useEffect(() => {
        const spaceName = currentSpace ? currentSpace.title : "";
        const collectionNum = collections ? collections.length : 0;
        setSpaceNameComponent(<SpaceName spaceName={spaceName} collectionsNum={collectionNum} />);
    }, [currentSpace, collections]);

    useEffect(() => {
        setCollectionsComponent(<Collections space={currentSpace} />);
    }, [currentSpace]);

    return (
        <div id="my-ext" data-theme="light">
            <div id="main-container" className="h-screen w-screen flex bg-[#FAFAFA]">
                <div id="navigation-panel-group" className="h-full flex-none basis-290 flex">
                    <div id="workspace-panel" className="h-full flex-none basis-70 py-16 flex flex-col">
                        {workspacesComponent}
                        {workspaceAddComponent}
                    </div>
                    <div id="space-panel" className="h-full flex-none basis-220 border-x-1 border-solid border-[#DDDDF5] flex flex-col">
                        {workspaceNameComponent}
                        {searchComponent}
                        {spacesComponent}
                    </div>
                </div>
                <div id="collection-container" className="h-full grow shrink basis-auto border-r-1 border-solid border-[#DDDDF5] flex flex-col max-w-[calc(100vw-510px)]">
                    {spaceNameComponent}
                    {collectionsComponent}
                </div>
                <div id="tab-container" className="h-full flex-none basis-220 max-w-220 flex flex-col">
                    {tabNameComponent}
                    {windowsComponent}
                </div>
            </div>
        </div>
    );
}
