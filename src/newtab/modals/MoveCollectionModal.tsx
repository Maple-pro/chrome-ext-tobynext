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
    <Modal onClose={onClose} label='Move collection'>
      <div className='modal-content'>
        <h2 className='modal-title'>
          Move {collection.title}
        </h2>

        {/* Workspace selector */}
        <div className='modal-field'>
          <label htmlFor='move-workspace' className='modal-label'>Workspace</label>
          <select id='move-workspace'
            value={selectedWorkspace?.id || DEFAULT_OPTION_VALUE}
            onChange={(e) => {
              setSelectedWorkspace(getBookmarkById(e.target.value, workspaces));
              setSelectedSpace(undefined);
            }}
            className='modal-input'
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
        <div className='modal-field'>
          <label htmlFor='move-space' className='modal-label'>Space</label>
          <select id='move-space'
            value={selectedSpace?.id || DEFAULT_OPTION_VALUE}
            onChange={(e) =>
              setSelectedSpace(getBookmarkById(e.target.value, spaces))
            }
            className='modal-input'
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
        <div className='modal-actions'>
          <button
            onClick={handleClose}
            type='button' className='secondary-button'
          >
            CANCEL
          </button>
          <button
            onClick={handleMove}
            type='button' className='primary-button'
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
