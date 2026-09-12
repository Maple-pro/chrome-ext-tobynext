import React, { JSX, useEffect, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';
import deleteCollectionIcon from '@assets/delete-collection.svg';
import expandCollectionIcon from '@assets/expand-window.svg';
import moreIcon from '@assets/more.svg';
import moveToIcon from '@assets/move-to.svg';
import openCollectionIcon from '@assets/open-collection.svg';

import { useNewTabContext } from '../context/NewTabContext';
import { useDropTarget } from '../hooks/useDrag';
import MoveCollectionModal from '../modals/MoveCollectionModal';
import Bookmark from './Bookmark';

interface CollectionProps {
  collection: BookmarkTreeNode;
}

const Collection = (props: CollectionProps): JSX.Element => {
  const { refresh } = useNewTabContext();

  const [bookmarks, setBookmarks] = useState<BookmarkTreeNode[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(props.collection.title);
  const { targetProps, dropClass, error } = useDropTarget(
    ['bookmark', 'tab'],
    props.collection.id
  );
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    chrome.bookmarks
      .getChildren(props.collection.id)
      .then((children) => {
        if (active) setBookmarks(children.filter((node) => !!node.url));
      })
      .catch(console.error);
    setNewTitle(props.collection.title);
    return () => {
      active = false;
    };
  }, [props.collection]);

  const handleExpandToggle = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleOpenCollection = () => {
    const urls = bookmarks
      .map((bookmarks) => bookmarks.url)
      .filter((url): url is string => !!url);
    if (urls.length > 0) {
      chrome.windows.create({
        focused: true,
        url: urls,
      });
    }
  };

  const handleDeleteCollection = async () => {
    await chrome.bookmarks.removeTree(props.collection.id);
    refresh();
  };

  const handleCollectionTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      chrome.bookmarks.update(props.collection.id, { title: newTitle }, () => {
        setIsEditing(false);
        refresh();
      });
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      setNewTitle(props.collection.title);
    }
  };

  return (
    <div
      id='collection-container'
      data-collection-id={props.collection.id}
      {...targetProps}
      className={`border-toby-outline-gray flex w-full grow-0 flex-col border-b-1 border-solid px-30 py-24 ${dropClass}`}
    >
      {error && <p role='alert'>{error}</p>}
      <div
        id='collection-title-container'
        className='flex flex-row items-center justify-between'
      >
        <div id='collection-title-group' className='flex flex-row items-center'>
          <div id='collection-title' className='mr-15 flex-1 text-[18px]'>
            {isEditing ? (
              <input
                type='text'
                value={newTitle}
                onChange={handleTitleChange}
                onKeyDown={handleKeyPress}
                autoFocus
                className='w-full border-b-1 border-black text-[18px] outline-none'
              />
            ) : (
              <span onClick={handleCollectionTitleClick} className='w-full'>
                {props.collection.title}
              </span>
            )}
          </div>
          {isEditing || (
            <div
              id='collection-expand-icon'
              className={`flex h-18 w-18 cursor-pointer items-center justify-center transition-transform duration-300 ${isExpanded ? '' : 'rotate-[-90deg]'}`}
              onClick={handleExpandToggle}
            >
              <img src={expandCollectionIcon} />
            </div>
          )}
        </div>
        <div id='collection-button-group' className='flex flex-row'>
          <div
            id='move-to-icon'
            onClick={() => setIsMoveModalOpen(true)}
            className='mx-10 flex h-18 w-18 cursor-pointer items-center justify-center'
          >
            <img src={moveToIcon} />
          </div>
          <div
            id='open-collection-icon'
            onClick={handleOpenCollection}
            className='mx-10 flex h-18 w-18 cursor-pointer items-center justify-center'
          >
            <img src={openCollectionIcon} />
          </div>
          <div
            id='delete-collection-icon'
            onClick={handleDeleteCollection}
            className='mx-10 flex h-18 w-18 cursor-pointer items-center justify-center'
          >
            <img src={deleteCollectionIcon} />
          </div>
          <div
            id='more-operation-icon'
            className='mx-10 flex h-18 w-18 cursor-pointer items-center justify-center'
          >
            <img src={moreIcon} />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div id='collection-items-container' className='pt-20'>
          {bookmarks.map((bookmark) => (
            <Bookmark key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}
      <MoveCollectionModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        collection={props.collection}
      />
    </div>
  );
};

export default Collection;
