import React, { JSX, useEffect, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';
import deleteCollectionIcon from '@assets/delete-collection.svg';
import expandCollectionIcon from '@assets/expand-window.svg';
import moveToIcon from '@assets/move-to.svg';
import openCollectionIcon from '@assets/open-collection.svg';

import { useNewTabContext } from '../context/NewTabContext';
import { useDragSource, useDropTarget } from '../hooks/useDrag';
import MoveCollectionModal from '../modals/MoveCollectionModal';
import Bookmark from './Bookmark';
import IconButton from './IconButton';

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
    ['bookmark', 'tab', 'collection'],
    (item) =>
      item.type === 'collection'
        ? {
            parentId: props.collection.parentId!,
            targetId: props.collection.id,
          }
        : { parentId: props.collection.id }
  );
  const { sourceProps, dragging } = useDragSource({
    type: 'collection',
    id: props.collection.id,
  });
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
    <section
      id='collection-container'
      data-collection-id={props.collection.id}
      {...sourceProps}
      {...targetProps}
      className={`collection-card ${dropClass} ${dragging ? 'is-dragging' : ''}`}
      aria-label={props.collection.title}
    >
      {error && (
        <p className='inline-error' role='alert'>
          {error}
        </p>
      )}
      <div id='collection-title-container' className='collection-header'>
        <div id='collection-title-group' className='collection-title-group'>
          <IconButton
            id='collection-expand-icon'
            icon={expandCollectionIcon}
            label={isExpanded ? 'Collapse collection' : 'Expand collection'}
            aria-expanded={isExpanded}
            className={isExpanded ? '' : 'is-collapsed'}
            onClick={handleExpandToggle}
          />
          <div id='collection-title' className='collection-title'>
            {isEditing ? (
              <input
                type='text'
                value={newTitle}
                onChange={handleTitleChange}
                onKeyDown={handleKeyPress}
                aria-label='Collection title'
                autoFocus
                className='collection-title-input'
              />
            ) : (
              <button
                type='button'
                className='title-button'
                title='Rename collection'
                onClick={handleCollectionTitleClick}
              >
                {props.collection.title}
              </button>
            )}
          </div>
          <span
            className='count-badge'
            title={`${bookmarks.length} saved tabs`}
          >
            {bookmarks.length}
          </span>
        </div>
        <div id='collection-button-group' className='collection-actions'>
          <IconButton
            id='move-to-icon'
            icon={moveToIcon}
            label='Move collection'
            onClick={() => setIsMoveModalOpen(true)}
          />
          <IconButton
            id='open-collection-icon'
            icon={openCollectionIcon}
            label='Open collection'
            disabled={!bookmarks.length}
            onClick={handleOpenCollection}
          />
          <span className='action-divider' />
          <IconButton
            id='delete-collection-icon'
            icon={deleteCollectionIcon}
            label='Delete collection'
            danger
            onClick={handleDeleteCollection}
          />
        </div>
      </div>
      {isExpanded && (
        <div id='collection-items-container' className='collection-items'>
          {bookmarks.length ? (
            bookmarks.map((bookmark) => (
              <Bookmark key={bookmark.id} bookmark={bookmark} />
            ))
          ) : (
            <div className='collection-empty'>
              <span aria-hidden='true'>+</span>Drop tabs or bookmarks here
            </div>
          )}
        </div>
      )}
      <MoveCollectionModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        collection={props.collection}
      />
    </section>
  );
};
export default Collection;
