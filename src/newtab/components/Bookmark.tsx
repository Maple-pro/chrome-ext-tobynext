import React, { JSX, useEffect, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';
import deleteBookmarkIcon from '@assets/close-tab.svg';
import defaultFavicon from '@assets/default-fav-icon.svg';
import editBookmarkIcon from '@assets/edit-bookmark.svg';

import { useNewTabContext } from '../context/NewTabContext';
import { useDragSource, useDropTarget } from '../hooks/useDrag';
import SingleTextModal from '../modals/SingleTextModal';
import { canClick } from '../services/drag';
import IconButton from './IconButton';

interface BookmarkProps {
  bookmark: BookmarkTreeNode;
}

const Bookmark = (props: BookmarkProps): JSX.Element => {
  const [isDeleted, setIsDeleted] = useState(false);
  const { dragging: isDragging, sourceProps } = useDragSource({
    type: 'bookmark',
    id: props.bookmark.id,
  });
  const { dropClass, targetProps, error } = useDropTarget(
    ['bookmark', 'tab'],
    props.bookmark.parentId!,
    props.bookmark.id
  );
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [faviconIndex, setFaviconIndex] = useState(0);
  const { refresh } = useNewTabContext();

  const handleRename = async (title: string) => {
    await chrome.bookmarks.update(props.bookmark.id, { title });
    refresh();
    setIsRenameModalOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenameModalOpen(true);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (props.bookmark.id) {
      chrome.bookmarks.remove(props.bookmark.id, () => {
        setIsDeleted(true);
      });
    }
  };

  useEffect(() => setFaviconIndex(0), [props.bookmark.url]);

  if (isDeleted) {
    return <div />;
  }

  const getFaviconCandidates = (url: string) => {
    try {
      const pageUrl = new URL(url);
      const chromeFavicon = new URL(chrome.runtime.getURL('_favicon/'));
      chromeFavicon.searchParams.set('pageUrl', pageUrl.href);
      chromeFavicon.searchParams.set('size', '32');
      return [chromeFavicon.href, new URL('/favicon.ico', pageUrl.origin).href];
    } catch {
      return [];
    }
  };
  const faviconCandidates = props.bookmark.url
    ? getFaviconCandidates(props.bookmark.url)
    : [];
  const faviconSrc = faviconCandidates[faviconIndex] || defaultFavicon;

  return (
    <div
      id='bookmark-container'
      data-bookmark-id={props.bookmark.id}
      className={`bookmark-row ${dropClass} ${isDragging ? 'is-dragging' : ''}`}
      {...sourceProps}
      {...targetProps}
      title={error || props.bookmark.url}
    >
      <span className='drag-grip' aria-hidden='true'>
        ⠿
      </span>
      <div id='bookmark-favicon' className='favicon-tile'>
        <img
          alt=''
          draggable={false}
          src={faviconSrc}
          onError={() => setFaviconIndex((index) => index + 1)}
        />
      </div>
      <a
        className='bookmark-link'
        href={props.bookmark.url}
        target='_blank'
        rel='noopener noreferrer'
        draggable={false}
        onClick={(event) => {
          event.stopPropagation();
          if (!canClick()) event.preventDefault();
        }}
      >
        <span id='bookmark-title' className='bookmark-title'>
          {props.bookmark.title || props.bookmark.url}
        </span>
        <span id='bookmark-url' className='bookmark-url'>
          {props.bookmark.url}
        </span>
      </a>
      <div id='bookmark-button-group' className='bookmark-actions'>
        <IconButton
          id='edit-bookmark-button'
          icon={editBookmarkIcon}
          label='Rename bookmark'
          onClick={handleEdit}
        />
        <IconButton
          id='delete-bookmark-button'
          icon={deleteBookmarkIcon}
          label='Delete bookmark'
          danger
          onClick={handleDelete}
        />
      </div>
      <SingleTextModal
        title='Rename Bookmark'
        initialValue={props.bookmark.title}
        inputLabel='Title'
        placeHolder='Enter a title'
        cancelBtnText='CANCEL'
        okBtnText='RENAME'
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onCreate={handleRename}
      />
    </div>
  );
};
export default Bookmark;
