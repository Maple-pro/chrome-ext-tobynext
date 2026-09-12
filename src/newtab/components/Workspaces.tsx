import React from 'react';
import { useNewTabContext } from '../context/NewTabContext';

const colors = ['#a7b4fa', '#a8d5c5', '#edc29b', '#d1b6e8', '#9fc9e4'];
export default function Workspaces() {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useNewTabContext();
  return <div id='workspaces' className='workspace-list'>
    {workspaces.map((workspace, index) => <button type='button' key={workspace.id}
      className='workspace-avatar' aria-label={workspace.title} title={workspace.title}
      aria-pressed={currentWorkspace?.id === workspace.id}
      style={{ '--workspace-color': colors[index % colors.length] } as React.CSSProperties}
      onClick={() => setCurrentWorkspace(workspace)}>
      {Array.from(workspace.title.trim())[0]?.toUpperCase() || 'W'}
    </button>)}
  </div>;
}
