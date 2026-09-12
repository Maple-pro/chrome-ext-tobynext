import React, { JSX, useState } from 'react';
import type { ChromeWindow } from '@/types';
import closeWindowIcon from '@assets/close-window.svg';
import expandWindowIcon from '@assets/expand-window.svg';
import saveWindowIcon from '@assets/save-window.svg';

import { useNewTabContext } from '../context/NewTabContext';
import Tab from './Tab';
import IconButton from './IconButton';

interface WindowProps {
  window: ChromeWindow;
  index: number;
}

const Window = (props: WindowProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { refresh, currentSpace } = useNewTabContext();
  const filteredTabs = (props.window.tabs ?? []).filter(
    (tab) =>
      tab.url &&
      !tab.url.startsWith('chrome://') &&
      !tab.url.startsWith(chrome.runtime.getURL(''))
  );

  const handleExpandToggel = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleCloseWindow = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.window.id) {
      chrome.windows.remove(props.window.id);
    }
  };

  const generateSavedCollectionTitle = () => {
    const date = new Date();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    return date.toLocaleString('en-US', options);
  };

  const handleSaveWindow = async (event: React.MouseEvent) => {
    if (!currentSpace || !currentSpace.id) {
      console.log('No current space, cannot save session');
      return;
    }
    event.stopPropagation();
    const newCollection = await chrome.bookmarks.create({
      parentId: currentSpace.id,
      title: generateSavedCollectionTitle(),
      index: 0,
    });

    for (const tab of filteredTabs) {
      if (tab.url) {
        await chrome.bookmarks.create({
          parentId: newCollection.id,
          title: tab.title || 'New Tab',
          url: tab.url,
        });
      }
    }

    refresh();
  };

  return (
    <section id='window-container' className='window-card'>
      <div id='window-title-group' className='window-header'>
        <div className='window-title-group'>
          <IconButton id='window-expand-button' icon={expandWindowIcon} label={isExpanded ? 'Collapse window' : 'Expand window'}
            aria-expanded={isExpanded} className={isExpanded ? '' : 'is-collapsed'} onClick={handleExpandToggel} />
          <h3 id='window-title'>Window {props.index}</h3><span className='count-badge'>{filteredTabs.length}</span>
        </div>
        <div id='window-buttons-group' className='window-actions'>
          <IconButton id='save-window-button' icon={saveWindowIcon} label='Save window as collection'
            disabled={!currentSpace || !filteredTabs.length} onClick={handleSaveWindow} />
          <IconButton id='close-window-button' icon={closeWindowIcon} label='Close window' danger onClick={handleCloseWindow} />
        </div>
      </div>
      {isExpanded && <div id='tab-group' className='tab-list'>
        {filteredTabs.length ? filteredTabs.map(tab => <Tab key={tab.id} tab={tab} />)
          : <p className='window-empty'>No tabs to save in this window.</p>}
      </div>}
    </section>
  );
};
export default Window;
