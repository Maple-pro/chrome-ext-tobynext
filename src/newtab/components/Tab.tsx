import React, { JSX } from 'react';
import type { ChromeTab } from '@/types';
import closeIcon from '@assets/close-tab.svg';
import defaultFavicon from '@assets/default-fav-icon.svg';

import { useDragSource } from '../hooks/useDrag';
import { canClick } from '../services/drag';
import IconButton from './IconButton';

interface TabProps {
  tab: ChromeTab;
}

const Tab = (props: TabProps): JSX.Element => {
  const { sourceProps, dragging } = useDragSource(
    { type: 'tab', id: props.tab.id! },
    '.tab-title'
  );

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
      {...sourceProps}
      className={`tab-row ${props.tab.active ? 'is-active' : ''} ${dragging ? 'is-dragging' : ''}`}
    >
      <img
        className='tab-favicon'
        alt=''
        draggable={false}
        src={props.tab.favIconUrl || defaultFavicon}
        onError={(event) => {
          event.currentTarget.src = defaultFavicon;
        }}
      />
      <button
        type='button'
        id='tab-title'
        className='tab-title'
        title={props.tab.title || props.tab.url}
        onClick={handleTabClick}
      >
        {props.tab.title || props.tab.url}
      </button>
      <IconButton
        id='tab-close-button'
        className='tab-close'
        icon={closeIcon}
        label='Close tab'
        danger
        onClick={handleCloseTab}
      />
    </div>
  );
};
export default Tab;
