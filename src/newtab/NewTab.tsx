import React, { JSX, useEffect, useState } from "react";
import findRootFolder from "./utils/findRootFolder";
import Workspaces from "./components/Workspaces";
import WorkspaceAdd from "./components/WorkspaceAdd";
import WorkspaceName from "./components/WorkspaceName";
import Search from "./components/Search";
import Spaces from "./components/Spaces";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export default function NewTab(): JSX.Element {
    const workspaceAddComponent = <WorkspaceAdd />
    const searchComponent = <Search />

    let [rootFolder, setRootFolder] = useState<BookmarkTreeNode | undefined>();
    let [workspacesComponent, setWorkspacesComponent] = useState<JSX.Element>();
    let [currentWorkspace, setCurrentWorkspace] = useState<BookmarkTreeNode | undefined>();
    let [workspaceNameComponent, setWorkspaceNameComponent] = useState<JSX.Element>();
    let [spacesComponent, setSpacesComponent] = useState<JSX.Element>();
    let [currentSpace, setCurrentSpace] = useState<BookmarkTreeNode | undefined>();

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
        }
    }, [currentSpace]);

    return (
        <div id="my-ext" data-theme="light">
            <div id="main-container" className="h-screen w-screen flex bg-[#FAFAFA]">
                <div id="navigation-panel-group" className="h-full flex-none basis-290 flex">
                    <div id="workspace-panel" className="h-full flex-none basis-70 py-16 flex flex-col">
                        {workspacesComponent}
                        {workspaceAddComponent}
                    </div>
                    <div id="space-panel" className="h-full flex-none basis-220 border-x-1 border-solid border-#DDDDF5 flex flex-col">
                        {workspaceNameComponent}
                        {searchComponent}
                        {spacesComponent}
                    </div>
                </div>
                <div id="data-panel-group" className="h-full w-10 flex-auto flex">
                    <div id="collection-container" className="h-full grow-85 shrink border-r-1 border-solid border-#DDDDF5" />
                    <div id="tab-container" className="h-full grow-15 shrink" />

                </div>

            </div>
        </div>
    );
}
