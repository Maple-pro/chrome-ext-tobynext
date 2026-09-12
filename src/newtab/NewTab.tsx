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
      {error && <div className='app-error' role='alert'>{error}<button type='button' onClick={refresh}>Try again</button></div>}
      <div id='main-container' className='app-layout'>
        <div id='navigation-panel-group' className='navigation-panels'>
          <nav id='workspace-panel' className='workspace-rail' aria-label='Workspaces'>
            <div className='brand-mark' title='Toby Next' aria-label='Toby Next'>t<span>n</span><i /></div>
            {rootFolder && <Workspaces />}
            {rootFolder && <WorkspaceAdd />}
            <div className='rail-footer'><Help /><TobyImport /></div>
          </nav>
          <aside id='space-panel' className='spaces-sidebar' aria-label='Spaces'>
            <WorkspaceName />
            <Search />
            {currentWorkspace && <Spaces />}
            <div className='sidebar-footer'><span className='status-dot' />Your personal tab library</div>
          </aside>
        </div>
        <main id='collections-main' className='collections-main'>
          <SpaceName />
          <Collections />
        </main>
        <aside id='tab-container' className='tabs-sidebar' aria-label='Open tabs'>
          <TabName />
          <Windows />
          <div className='tabs-footer'><span aria-hidden='true'>↖</span> Drag a tab into a collection to save it</div>
        </aside>
      </div>
    </div>
  );
}
