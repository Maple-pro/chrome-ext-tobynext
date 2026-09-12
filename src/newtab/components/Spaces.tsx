import React, { JSX, useState } from 'react';
import addSpaceIcon from '@assets/add-space.svg';

import { useNewTabContext } from '../context/NewTabContext';
import SingleTextModal from '../modals/SingleTextModal';
import SpaceRow from './SpaceRow';

const Spaces = (): JSX.Element => {
  const { spaces } = useNewTabContext();
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const { currentWorkspace, setCurrentSpace, refresh } = useNewTabContext();

  const handleCreateSpace = (title: string) => {
    if (currentWorkspace) {
      chrome.bookmarks.create(
        {
          title: title,
          parentId: currentWorkspace.id,
        },
        (newSpace) => {
          setCurrentSpace(newSpace);
          refresh();
          setIsNewSpaceModalOpen(false);
        }
      );
    }
  };

  return (
    <div
      id='space-container'
      className='no-scrollbar flex flex-col overflow-y-auto px-12 py-16'
    >
      <div id='space-title-container' className='flex flex-row justify-between'>
        <div id='title' className='text-[12px] font-bold'>
          SPACES
        </div>
        <div
          id='add-space'
          onClick={() => setIsNewSpaceModalOpen(true)}
          className='cursor-pointer'
        >
          <img src={addSpaceIcon} className='h-15 w-15' />
        </div>
      </div>

      <div id='spaces-container' className='flex flex-col overflow-auto pt-15'>
        {spaces.map((space) => (
          <SpaceRow key={space.id} space={space} />
        ))}
      </div>

      <SingleTextModal
        title='Create New Space'
        inputLabel='Title'
        placeHolder='Enter title'
        cancelBtnText='CANCEL'
        okBtnText='CREATE'
        isOpen={isNewSpaceModalOpen}
        onClose={() => setIsNewSpaceModalOpen(false)}
        onCreate={handleCreateSpace}
      />
    </div>
  );
};

export default Spaces;
