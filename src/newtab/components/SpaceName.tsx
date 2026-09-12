import React, { JSX, useState } from "react";
import SingleTextModal from "../modals/SingleTextModal";
import { useNewTabContext } from "../context/NewTabContext";


const SpaceName = (): JSX.Element => {
    const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
    const {currentSpace, collections, refresh} = useNewTabContext();

    const handleCreateCollection = (title: string) => {
        if (!currentSpace) {
            return;
        }

        chrome.bookmarks.create(
            {
                title: title,
                parentId: currentSpace.id,
                index: 0,
            },
            () => {
                refresh();
                setIsNewCollectionModalOpen(false);
            }
        )
    }

    return (
      <header id='space-name-panel' className='space-heading'>
        <div className='space-heading-copy'>
          <span className='eyebrow'>YOUR LIBRARY</span>
          <h1 id='space-name' title={currentSpace?.title}>{currentSpace?.title || 'Your collections'}</h1>
          <p><span id='collection-number'>{collections.length} {collections.length === 1 ? 'collection' : 'collections'}</span><span className='heading-separator'>/</span>A home for your favorite tabs</p>
        </div>
        <button type='button' id='add-collection-button' className='primary-button' disabled={!currentSpace}
          onClick={() => setIsNewCollectionModalOpen(true)}><span aria-hidden='true'>+</span> New collection</button>
        <SingleTextModal title='Create New Collection' inputLabel='Title' placeHolder='e.g. Design inspiration'
          cancelBtnText='CANCEL' okBtnText='CREATE' isOpen={isNewCollectionModalOpen}
          onClose={() => setIsNewCollectionModalOpen(false)} onCreate={handleCreateCollection} />
      </header>
    );
}
export default SpaceName;
