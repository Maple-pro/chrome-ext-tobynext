import React from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import { useDragSource, useDropTarget } from '../hooks/useDrag';
import { canClick } from '../services/drag';

const colors = ['#a7b4fa', '#a8d5c5', '#edc29b', '#d1b6e8', '#9fc9e4'];

function WorkspaceRow({
  workspace,
  index,
}: {
  workspace: chrome.bookmarks.BookmarkTreeNode;
  index: number;
}) {
  const { currentWorkspace, setCurrentWorkspace } = useNewTabContext();
  const { sourceProps, dragging } = useDragSource(
    { type: 'workspace', id: workspace.id },
    '.workspace-avatar'
  );
  const { targetProps, dropClass, error } = useDropTarget(
    ['workspace', 'space'],
    (item) =>
      item.type === 'space'
        ? { parentId: workspace.id }
        : { parentId: workspace.parentId!, targetId: workspace.id }
  );
  return (
    <button
      type='button'
      {...sourceProps}
      {...targetProps}
      className={`workspace-avatar ${dropClass}`}
      data-workspace-id={workspace.id}
      aria-label={workspace.title}
      title={error || workspace.title}
      aria-pressed={currentWorkspace?.id === workspace.id}
      style={
        {
          '--workspace-color': colors[index % colors.length],
          opacity: dragging ? 0.5 : 1,
        } as React.CSSProperties
      }
      onClick={() => {
        if (canClick()) setCurrentWorkspace(workspace);
      }}
    >
      {Array.from(workspace.title.trim())[0]?.toUpperCase() || 'W'}
    </button>
  );
}

export default function Workspaces() {
  const { workspaces } = useNewTabContext();
  return (
    <div id='workspaces' className='workspace-list'>
      {workspaces.map((workspace, index) => (
        <WorkspaceRow key={workspace.id} workspace={workspace} index={index} />
      ))}
    </div>
  );
}
