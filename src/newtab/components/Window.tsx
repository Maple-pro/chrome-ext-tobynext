import React, { JSX, useState } from 'react';
import type { ChromeWindow } from '@/types';
import closeWindowIcon from '@assets/close-window.svg';
import expandWindowIcon from '@assets/expand-window.svg';
import saveWindowIcon from '@assets/save-window.svg';

import { useNewTabContext } from '../context/NewTabContext';
import Tab from './Tab';

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
    <div
      id='window-container'
      className='border-toby-outline-gray shadow-toby-outline-gray my-5 flex w-full flex-none flex-col items-center rounded-sm border-1 border-solid px-12 py-10 shadow-xs'
    >
      <div
        id='window-title-group'
        className='mb-5 flex w-full flex-row items-center justify-between'
      >
        <div id='window-title-group' className='flex flex-row items-center'>
          <div id='window-title' className='mr-5 text-[12px] text-[#474759]'>
            Window {props.index}
          </div>
          <div
            id='window-expand-button'
            className={`flex h-12 w-12 flex-none cursor-pointer items-center justify-center transition-transform duration-300 ${isExpanded ? '' : 'rotate-[-90deg]'}`}
            onClick={handleExpandToggel}
          >
            <img src={expandWindowIcon} />
          </div>
        </div>
        <div id='window-buttons-group' className='flex flex-row items-center'>
          <div
            id='save-window-button'
            onClick={handleSaveWindow}
            className='mx-5 flex h-12 w-12 flex-none cursor-pointer items-center justify-center'
          >
            <img src={saveWindowIcon} />
          </div>
          <div
            id='close-window-button'
            onClick={handleCloseWindow}
            className='mx-5 flex h-12 w-12 flex-none cursor-pointer items-center justify-center'
          >
            <img src={closeWindowIcon} />
          </div>
        </div>
      </div>
      {isExpanded && (
        <div id='tab-group' className='flex w-full flex-col items-center'>
          {filteredTabs.map((tab) => (
            <Tab key={tab.id} tab={tab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Window;
