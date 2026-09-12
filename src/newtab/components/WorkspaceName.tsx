import React from 'react';
import { useNewTabContext } from '../context/NewTabContext';
export default function WorkspaceName() {
  const { currentWorkspace } = useNewTabContext();
  return <header id='workspace-name-container' className='workspace-heading'>
    <span className='eyebrow'>WORKSPACE</span>
    <h1 title={currentWorkspace?.title}>{currentWorkspace?.title || 'Toby Next'}</h1>
  </header>;
}
