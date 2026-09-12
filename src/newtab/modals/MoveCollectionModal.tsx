import React, { useEffect, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';

import { useNewTabContext } from '../context/NewTabContext';
import fetchSubFolder from '../utils/fetchSubFolder';
import getBookmarkById from '../utils/getBookmarkById';
import Modal from './Modal';

interface MoveCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: BookmarkTreeNode;
}

const MoveCollectionModal: React.FC<MoveCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
}) => {
  const { workspaces, setCurrentWorkspace, setCurrentSpace } =
    useNewTabContext();

  const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<BookmarkTreeNode>();
  const [selectedSpace, setSelectedSpace] = useState<BookmarkTreeNode>();
  const DEFAULT_OPTION_VALUE = 'DEFAULT';

  // get spaces
  useEffect(() => {
    let active = true;
    const fetchSpaces = async () => {
      if (selectedWorkspace) {
        const folders = await fetchSubFolder(selectedWorkspace);
        if (active) setSpaces(folders);
      } else {
        setSpaces([]);
      }
    };

    void fetchSpaces().catch(console.error);
    return () => {
      active = false;
    };
  }, [selectedWorkspace]);

  const handleMove = () => {
    if (selectedSpace) {
      chrome.bookmarks.move(
        collection.id,
        { parentId: selectedSpace.id, index: 0 },
        () => {
          onClose();
          setCurrentWorkspace(selectedWorkspace);
          setCurrentSpace(selectedSpace);
        }
      );
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedWorkspace(undefined);
    setSelectedSpace(undefined);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose} label='MoveCollection'>
      <div className='bg-toby-bg-gray relative flex w-500 flex-col items-start justify-between rounded-md px-24 py-12 opacity-100 shadow-md'>
        <h2 className='mb-15 text-[18px] font-bold'>
          Move {collection.title} Collection to
        </h2>

        {/* Workspace selector */}
        <div className='mb-15 w-full'>
          <label className='mb-10 block text-[14px]'>Workspace</label>
          <select
            value={selectedWorkspace?.id || DEFAULT_OPTION_VALUE}
            onChange={(e) => {
              setSelectedWorkspace(getBookmarkById(e.target.value, workspaces));
              setSelectedSpace(undefined);
            }}
            className='h-35 w-full rounded border p-4 text-[14px]'
          >
            <option value={DEFAULT_OPTION_VALUE} disabled>
              Select a workspace
            </option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.title}
              </option>
            ))}
          </select>
        </div>

        {/* Space selector */}
        <div className='mb-15 w-full'>
          <label className='mb-10 block text-[14px]'>Space</label>
          <select
            value={selectedSpace?.id || DEFAULT_OPTION_VALUE}
            onChange={(e) =>
              setSelectedSpace(getBookmarkById(e.target.value, spaces))
            }
            className='h-35 w-full rounded border p-4 text-[14px]'
            disabled={!selectedWorkspace}
          >
            <option value={DEFAULT_OPTION_VALUE} disabled>
              Select a space
            </option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.title}
              </option>
            ))}
          </select>
        </div>

        {/* buttons */}
        <div className='flex w-full items-center justify-between space-x-4'>
          <button
            onClick={handleClose}
            className='text-toby-blue mx-10 basis-1/2 cursor-pointer rounded-md px-10 py-5 font-bold'
          >
            CANCEL
          </button>
          <button
            onClick={handleMove}
            className={`mx-10 basis-1/2 rounded px-10 py-5 ${selectedSpace ? 'bg-toby-blue text-toby-bg-gray' : 'cursor-not-allowed text-gray-300 outline-gray-300'}`}
            disabled={!selectedSpace}
          >
            MOVE
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveCollectionModal;
