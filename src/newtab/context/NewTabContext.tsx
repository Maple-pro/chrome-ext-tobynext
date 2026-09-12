import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { BookmarkTreeNode } from '@/types';

import { useStoredState } from '../hooks/useStoredState';
import { loadSelection } from '../services/bookmarks';

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
  error?: string;
  dragType: string;
  setDragType: (dragType: string) => void;
}

const NewTabContext = createContext<NewTabContextType | undefined>(undefined);

export const useNewTabContext = () => {
  const context = useContext(NewTabContext);
  if (!context) {
    throw new Error('useNewTabContext must be used within a NewTabProvider');
  }

  return context;
};

export const NewTabProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rootFolder, setRootFolder] = useState<BookmarkTreeNode>();
  const [currentWorkspace, setCurrentWorkspace, isCurrentWorkspaceLoaded] =
    useStoredState<BookmarkTreeNode | undefined>('currentWorkspace');
  const [currentSpace, setCurrentSpace, isCurrentSpaceLoaded] = useStoredState<
    BookmarkTreeNode | undefined
  >('currentSpace');
  const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);
  const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
  const [collections, setCollections] = useState<BookmarkTreeNode[]>([]);

  const [forceUpdate, setForceUpdate] = useState(0);

  const refresh = useCallback(() => setForceUpdate((value) => value + 1), []);

  const [dragType, setDragType] = useState<string>('');

  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!isCurrentWorkspaceLoaded || !isCurrentSpaceLoaded) return;
    let cancelled = false;
    loadSelection(currentWorkspace?.id, currentSpace?.id)
      .then((snapshot) => {
        if (cancelled) return;
        setRootFolder(snapshot.rootFolder);
        setWorkspaces(snapshot.workspaces);
        setSpaces(snapshot.spaces);
        setCollections(snapshot.collections);
        setCurrentWorkspace(snapshot.currentWorkspace);
        setCurrentSpace(snapshot.currentSpace);
        setError(undefined);
      })
      .catch((reason) => {
        if (!cancelled) setError(String(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [
    isCurrentWorkspaceLoaded,
    isCurrentSpaceLoaded,
    currentWorkspace?.id,
    currentSpace?.id,
    forceUpdate,
    setCurrentWorkspace,
    setCurrentSpace,
  ]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const changed = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setForceUpdate((value) => value + 1), 80);
    };
    const events = [
      chrome.bookmarks.onCreated,
      chrome.bookmarks.onRemoved,
      chrome.bookmarks.onChanged,
      chrome.bookmarks.onMoved,
      chrome.bookmarks.onChildrenReordered,
      chrome.bookmarks.onImportEnded,
    ];
    events.forEach((event) => event.addListener(changed));
    return () => {
      clearTimeout(timer);
      events.forEach((event) => event.removeListener(changed));
    };
  }, []);

  return (
    <NewTabContext.Provider
      value={{
        error,
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
