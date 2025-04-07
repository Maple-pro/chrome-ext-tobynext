import React, { createContext, useContext, useState, useEffect } from "react";
import { useStoredState } from "../hooks/useStoredState";
import findRootFolder from "../utils/findRootFolder";
import fetchSubFolder from "../utils/fetchSubFolder";

const DEFAULT_WORKSPACE_TITLE = "Toby";
const DEFAULT_SPACE_TITLE = "My Collection";

interface NewTabContextType {
    rootFolder?: BookmarkTreeNode;
    currentWorkspace?: BookmarkTreeNode;
    setCurrentWorkspace: (workspace: BookmarkTreeNode | undefined) => void;
    currentSpace?: BookmarkTreeNode;
    setCurrentSpace: (space: BookmarkTreeNode | undefined) => void;
    workspaces: BookmarkTreeNode[];
    spaces: BookmarkTreeNode[];
    collections: BookmarkTreeNode[];
    refresh: () => void;
    dragType: string,
    setDragType: (dragType: string) => void;
}

const NewTabContext = createContext<NewTabContextType | undefined>(undefined);

export const useNewTabContext = () => {
    const context = useContext(NewTabContext);
    if (!context) {
        throw new Error("useNewTabContext must be used within a NewTabProvider");
    }

    return context;
};

export const NewTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rootFolder, setRootFolder] = useState<BookmarkTreeNode>();
    const [currentWorkspace, setCurrentWorkspace, isCurrentWorkspaceLoaded] = useStoredState<BookmarkTreeNode | undefined>("currentWorkspace");
    const [currentSpace, setCurrentSpace, isCurrentSpaceLoaded] = useStoredState<BookmarkTreeNode | undefined>("currentSpace");
    const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);
    const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
    const [collections, setCollections] = useState<BookmarkTreeNode[]>([]);

    const [forceUpdate, setForceUpdate] = useState(0);

    const [dragType, setDragType] = useState<string>("");

    const [isInitialized, setIsInitialized] = useState(false);

    // force refresh
    const refresh = () => {
        setForceUpdate(prev => prev + 1);
    };

    // init: rootFolder, workspaces, spaces, collections, currentWorkspace, currentSpace
    useEffect(() => {
        setIsInitialized(false);

        const initialize = async () => {
            // 1. find or create rootFolder
            const rootFolderTemp = await findRootFolder();
            setRootFolder(rootFolderTemp);

            // 2. find or create workspaces
            let workspacesTemp = await fetchSubFolder(rootFolderTemp);
            if (workspacesTemp.length === 0) {
                await chrome.bookmarks.create({ parentId: rootFolderTemp.id, title: DEFAULT_WORKSPACE_TITLE });
                workspacesTemp = await fetchSubFolder(rootFolderTemp);
            }
            setWorkspaces(workspacesTemp);

            // 3. set currentWorkspace
            let currentWorkspaceTemp = currentWorkspace;
            if (
                !isCurrentWorkspaceLoaded || 
                !currentWorkspaceTemp || 
                currentWorkspaceTemp.parentId !== rootFolderTemp.id
            ) {
                currentWorkspaceTemp = workspacesTemp[0];
                setCurrentWorkspace(currentWorkspaceTemp);
                console.log("Use default workspace: ", currentWorkspaceTemp.title);
            }

            // 4. find or create spaces
            let spacesTemp = await fetchSubFolder(currentWorkspaceTemp);
            if (spacesTemp.length === 0) {
                await chrome.bookmarks.create({ parentId: currentWorkspaceTemp.id, title: DEFAULT_SPACE_TITLE });
                spacesTemp = await fetchSubFolder(currentWorkspaceTemp);
            }
            setSpaces(spacesTemp);

            // 5. set currentSpace
            let currentSpaceTemp = currentSpace;
            if (
                !isCurrentSpaceLoaded ||
                !currentSpaceTemp ||
                currentSpaceTemp.parentId !== currentWorkspaceTemp.id
            ) {
                currentSpaceTemp = spacesTemp[0];
                setCurrentSpace(currentSpaceTemp);
                console.log("Use default space: ", currentSpaceTemp.title);
            }

            // 6. find collections
            if (currentSpaceTemp) {
                const collectionsTemp = await fetchSubFolder(currentSpaceTemp);
                setCollections(collectionsTemp);
            } else {
                setCollections([]);
            }

            setIsInitialized(true);
        };

        if (isCurrentSpaceLoaded && isCurrentSpaceLoaded) {
            initialize();
        }
    }, [isCurrentWorkspaceLoaded, isCurrentSpaceLoaded, forceUpdate]);

    // click workspace to update spaces
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        const updateSpaces = async () => {
            if (!currentWorkspace) {
                return;
            }

            let fetchedSpaces = await fetchSubFolder(currentWorkspace);
            if (fetchedSpaces.length === 0) {
                await chrome.bookmarks.create({ parentId: currentWorkspace.id, title: DEFAULT_SPACE_TITLE });
                fetchedSpaces = await fetchSubFolder(currentWorkspace);
            }
            setSpaces(fetchedSpaces);

            if (!currentSpace || currentSpace.parentId !== currentWorkspace.id) {
                setCurrentSpace(fetchedSpaces[0]);
            }
        };

        updateSpaces();
    }, [currentWorkspace]);

    // click space to update collections
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        const updateCollections = async () => {
            if (!currentSpace) {
                setCollections([]);
                return;
            }

            const fetchedCollections = await fetchSubFolder(currentSpace);
            setCollections(fetchedCollections);
        };

        updateCollections();
    }, [currentSpace]);

    return (
        <NewTabContext.Provider
            value={{
                rootFolder,
                currentWorkspace,
                setCurrentWorkspace,
                currentSpace,
                setCurrentSpace,
                workspaces,
                spaces,
                collections,
                refresh,
                dragType,
                setDragType,
            }}
        >
            {children}
        </NewTabContext.Provider>
    );

};