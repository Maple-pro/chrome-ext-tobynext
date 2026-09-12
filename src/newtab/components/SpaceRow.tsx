import React from 'react';
import type { BookmarkTreeNode } from '@/types';
import selectedFolderIcon from '@assets/folder-selected.svg';
import folderIcon from '@assets/folder.svg';

import { useNewTabContext } from '../context/NewTabContext';
import { useDragSource, useDropTarget } from '../hooks/useDrag';
import { canClick } from '../services/drag';

export default function SpaceRow({ space }: { space: BookmarkTreeNode }) {
  const { currentSpace, setCurrentSpace, dragType } = useNewTabContext();
  const { sourceProps, dragging } = useDragSource({
    type: 'space',
    id: space.id,
  });
  const { targetProps, dropClass, error } = useDropTarget(
    ['space', 'collection'],
    dragType === 'collection' ? space.id : space.parentId!,
    dragType === 'collection' ? undefined : space.id
  );
  const selected = currentSpace?.id === space.id;
  return (
    <div
      {...sourceProps}
      {...targetProps}
      role='button'
      data-space-id={space.id}
      tabIndex={0}
      onClick={() => {
        if (canClick()) setCurrentSpace(space);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setCurrentSpace(space);
        }
      }}
      title={error || space.title}
      style={{ opacity: dragging ? 0.5 : 1 }}
      aria-current={selected ? 'page' : undefined}
      className={`space-row ${dropClass}`}
    >
      <img
        src={selected ? selectedFolderIcon : folderIcon}
        alt=''
        className='mr-10 h-15 w-15'
      />
      <span
        className={`truncate text-[14px] ${selected ? 'text-toby-blue font-bold' : ''}`}
      >
        {space.title}
      </span>
    </div>
  );
}
