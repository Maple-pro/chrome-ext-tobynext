import React, { createContext, useContext, useState, useEffect } from "react";
import { useStoredState } from "../hooks/useStoredState";
import findRootFolder from "../utils/findRootFolder";
import fetchSubFolder from "../utils/fetchSubFolder";

interface NewTabContextType {
    rootFolder?: BookmarkTreeNode;
    currentWorkspace?: BookmarkTreeNode;
    setCurrentWorkspace: (workspace: BookmarkTreeNode | undefined) => void;
    currentSpace?: BookmarkTreeNode;
    setCurrentSpace: (space: BookmarkTreeNode | undefined) => void;
    workspaces: BookmarkTreeNode[];
    spaces: BookmarkTreeNode[];
    collections: BookmarkTreeNode[];
    refreshWorkspaces: () => void;
    refreshSpaces: () => void;
    refreshCollections: () => void;
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

    const [forceUpdateWorkspaces, setForceUpdateWorkspaces] = useState(0);
    const [forceUpdateSpaces, setForceUpdateSpaces] = useState(0);
    const [forceUpdateCollections, setForceUpdateCollections] = useState(0);

    // force refresh workspaces
    const refreshWorkspaces = () => {
        setForceUpdateWorkspaces(prev => prev + 1);
    };

    // force refresh spaces
    const refreshSpaces = () => {
        setForceUpdateSpaces(prev => prev + 1);
    };

    // force refresh collections
    const refreshCollections = () => {
        setForceUpdateCollections(prev => prev + 1);
    };

    // get rootFolder
    useEffect(() => {
        const fetchRootFolder = async () => {
            const folder = await findRootFolder();
            setRootFolder(folder);
        };

        fetchRootFolder();
    }, []);

    // get workspaces
    useEffect(() => {
        if (rootFolder) {
            fetchSubFolder(rootFolder, setWorkspaces);
        }
    }, [rootFolder, forceUpdateWorkspaces]);

    // get spaces
    useEffect(() => {
        if (currentWorkspace) {
            fetchSubFolder(currentWorkspace, setSpaces);
        }
    }, [currentWorkspace, forceUpdateSpaces]);

    // get collections
    useEffect(() => {
        if (currentSpace) {
            fetchSubFolder(currentSpace, setCollections);
        } else {
            setCollections([]);
        }
    }, [currentSpace, forceUpdateCollections]);

    // set currentWorkspace
    // When `props.currentWorkspace` is undefined and workspaces is not empty, use default workspace
    useEffect(() => {
        if (!isCurrentWorkspaceLoaded && workspaces.length > 0 && !currentWorkspace) {
            setCurrentWorkspace(workspaces[0]); 
            console.log("Use default workspace: " + workspaces[0].title);
        }
    }, [isCurrentWorkspaceLoaded, workspaces, currentWorkspace]);

    // set currentSpace
    // When `props.currentSpace` is undefined or `props.currentSpace.parentId` is not `props.currentWorkspace`
    // use default spaces
    useEffect(() => {
        if (!isCurrentWorkspaceLoaded || !isCurrentSpaceLoaded) {
            return;
        }

        if (!currentWorkspace) {
            setCurrentSpace(undefined);
            console.log("Use default space: undefined for no currentWorkspace");
        } else if (!currentSpace || currentSpace.parentId !== currentWorkspace.id) {
            // use default spaces
            if (spaces.length == 0) {
                setCurrentSpace(undefined);
                console.log("Use default space: undefined for no spaces");
            } else {
                if (spaces[0].parentId === currentWorkspace.id) {
                    setCurrentSpace(spaces[0]);
                    console.log("Use default space: " + spaces[0].title);
                } else {
                    setCurrentSpace(undefined);
                    console.log("Use default space: undefined");
                }
            }
        }
    }, [isCurrentWorkspaceLoaded, isCurrentSpaceLoaded, spaces, currentSpace, setCurrentSpace])

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
                refreshWorkspaces,
                refreshSpaces,
                refreshCollections,
            }}
        >
            {children}
        </NewTabContext.Provider>
    );

};