import React, { JSX, useState } from 'react';
import addSpaceIcon from '@assets/add-space.svg';

import { useNewTabContext } from '../context/NewTabContext';
import SingleTextModal from '../modals/SingleTextModal';
import SpaceRow from './SpaceRow';
import IconButton from './IconButton';

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
      className='spaces-section'
    >
      <div id='space-title-container' className='section-heading'>
        <div id='title' className='eyebrow'>
          SPACES
        </div>
        <IconButton id='add-space' icon={addSpaceIcon} label='Create space' onClick={() => setIsNewSpaceModalOpen(true)} />
      </div>

      <div id='spaces-container' className='space-list'>
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
