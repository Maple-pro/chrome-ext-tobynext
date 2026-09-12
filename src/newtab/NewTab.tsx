import React, { JSX } from 'react';

import Collections from './components/Collections';
import Help from './components/Help';
import Search from './components/Search';
import SpaceName from './components/SpaceName';
import Spaces from './components/Spaces';
import TabName from './components/TabName';
import TobyImport from './components/TobyImport';
import Windows from './components/Windows';
import WorkspaceAdd from './components/WorkspaceAdd';
import WorkspaceName from './components/WorkspaceName';
import Workspaces from './components/Workspaces';
import { NewTabProvider, useNewTabContext } from './context/NewTabContext';

export default function NewTab(): JSX.Element {
  return (
    <NewTabProvider>
      <NewTabContent />
    </NewTabProvider>
  );
}

function NewTabContent(): JSX.Element {
  const { rootFolder, currentWorkspace, error, refresh } = useNewTabContext();

  return (
    <div id='my-ext' data-theme='light'>
      {error && (
        <div role='alert'>
          {error} <button onClick={refresh}>Retry</button>
        </div>
      )}
      <div
        id='main-container'
        className='bg-toby-bg-gray flex h-screen w-screen'
      >
        <div
          id='navigation-panel-group'
          className='flex h-full flex-none basis-290'
        >
          <div
            id='workspace-panel'
            className='flex h-full flex-none basis-70 flex-col py-16'
          >
            {rootFolder && <Workspaces />}
            {rootFolder && <WorkspaceAdd />}
            <Help />
            <TobyImport />
          </div>
          <div
            id='space-panel'
            className='border-toby-outline-gray flex h-full flex-none basis-220 flex-col border-x-1 border-solid'
          >
            {currentWorkspace && <WorkspaceName />}
            <Search />
            {currentWorkspace && <Spaces />}
          </div>
        </div>
        <div
          id='collection-container'
          className='border-toby-outline-gray flex h-full max-w-[calc(100vw-510px)] shrink grow basis-auto flex-col border-r-1 border-solid'
        >
          <SpaceName />
          <Collections />
        </div>
        <div
          id='tab-container'
          className='flex h-full max-w-220 flex-none basis-220 flex-col'
        >
          <TabName />
          <Windows />
        </div>
      </div>
    </div>
  );
}
