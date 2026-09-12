import React, { JSX, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';
import deleteBookmarkIcon from '@assets/close-tab.svg';
import defaultFavicon from '@assets/default-fav-icon.svg';
import editBookmarkIcon from '@assets/edit-bookmark.svg';

import { useNewTabContext } from '../context/NewTabContext';
import { useDragSource, useDropTarget } from '../hooks/useDrag';
import SingleTextModal from '../modals/SingleTextModal';
import { canClick } from '../services/drag';

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

  if (isDeleted) {
    return <div />;
  }

  const getFaviconUrl = (url: string) => {
    const favicon = new URL(chrome.runtime.getURL('/_favicon/'));
    favicon.searchParams.set('pageUrl', url);
    favicon.searchParams.set('size', '32');
    return favicon.href;
  };

  return (
    <div
      id='bookmark-container'
      data-bookmark-id={props.bookmark.id}
      onClick={() => {
        if (canClick()) window.open(props.bookmark.url, '_blank', 'noopener');
      }}
      className={`group shadow-toby-outline-gray border-toby-outline-gray my-10 flex h-40 w-full cursor-pointer flex-row items-center justify-between rounded-md border-1 border-solid px-20 py-10 shadow-sm ${dropClass} ${isDragging ? 'opacity-50' : ''}`}
      {...sourceProps}
      {...targetProps}
      title={error || props.bookmark.title}
    >
      <div
        id='bookmark-favicon'
        className='mr-10 flex h-16 w-16 flex-none items-center justify-center'
      >
        <img
          src={
            props.bookmark.url
              ? getFaviconUrl(props.bookmark.url)
              : defaultFavicon
          }
          onError={(e) => {
            e.currentTarget.src = defaultFavicon;
          }}
          className='h-full w-full object-contain'
        />
      </div>
      <div
        id='bookmark-title'
        className='shrink-1 grow-0 basis-1/2 truncate pr-20 text-[14px]'
      >
        {props.bookmark.title}
      </div>
      <div
        id='bookmark-url'
        className='shrink-4 grow-0 basis-1/2 truncate text-[12px] text-[#474759]'
      >
        {props.bookmark.url}
      </div>
      <div
        id='bookmark-button-group'
        className='invisible flex flex-none flex-row group-hover:visible'
      >
        <button
          type='button'
          aria-label='Rename bookmark'
          id='edit-bookmark-button'
          onClick={handleEdit}
          className='ml-10 flex h-16 w-16 items-center justify-center'
        >
          <img src={editBookmarkIcon} />
        </button>
        <button
          type='button'
          aria-label='Delete bookmark'
          id='delete-bookmark-button'
          onClick={handleDelete}
          className='ml-10 flex h-16 w-16 items-center justify-center'
        >
          <img src={deleteBookmarkIcon} />
        </button>
      </div>

      <SingleTextModal
        title='Rename Bookmark'
        initialValue={props.bookmark.title}
        inputLabel='Title'
        placeHolder='Enter Title'
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
