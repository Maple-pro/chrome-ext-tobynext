import React, { JSX } from 'react';
import type { ChromeTab } from '@/types';
import closeIcon from '@assets/close-tab.svg';
import defaultFavicon from '@assets/default-fav-icon.svg';

import { useDragSource } from '../hooks/useDrag';
import { canClick } from '../services/drag';

interface TabProps {
  tab: ChromeTab;
}

const Tab = (props: TabProps): JSX.Element => {
  const { sourceProps, dragging } = useDragSource({
    type: 'tab',
    id: props.tab.id!,
  });

  const handleTabClick = () => {
    if (!canClick()) return;
    if (props.tab.windowId) {
      chrome.windows.update(props.tab.windowId, { focused: true }, () => {
        if (props.tab.id) {
          chrome.tabs.update(props.tab.id, { active: true });
        }
      });
    }
  };

  const handleCloseTab = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.tab.id) {
      chrome.tabs.remove(props.tab.id);
    }
  };

  return (
    <div
      id='tab'
      data-tab-id={props.tab.id}
      onClick={handleTabClick}
      {...sourceProps}
      style={{ opacity: dragging ? 0.5 : 1 }}
      className='group border-toby-outline-gray shadow-toby-outline-gray my-5 flex h-35 w-full cursor-pointer flex-row items-center rounded-sm border-1 border-solid px-10 py-5 shadow-sm'
    >
      <div
        id='tab-icon'
        className='mr-10 flex h-15 w-15 flex-none items-center justify-center'
      >
        <img
          src={props.tab.favIconUrl ? props.tab.favIconUrl : defaultFavicon}
          onError={(e) => {
            e.currentTarget.src = defaultFavicon;
          }}
          className='h-full w-full object-contain'
        />
      </div>
      <div id='tab-title' className='truncate text-[14px]'>
        {props.tab.title}
      </div>
      <div
        id='tab-close-button'
        onClick={handleCloseTab}
        className='ml-auto hidden h-15 w-15 flex-none items-center justify-center group-hover:flex'
      >
        <img src={closeIcon} className='h-full w-full' />
      </div>
    </div>
  );
};

export default Tab;
