import React, { JSX, useState } from 'react';
import type { ChromeTab, ChromeTabGroup, OpenTabsWindow } from '@/types';
import closeWindowIcon from '@assets/close-window.svg';
import expandWindowIcon from '@assets/expand-window.svg';
import saveWindowIcon from '@assets/save-window.svg';

import { useNewTabContext } from '../context/NewTabContext';
import IconButton from './IconButton';
import Tab from './Tab';

interface WindowProps {
  window: OpenTabsWindow;
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
  const groupById = new Map(
    props.window.tabGroups.map((group) => [group.id, group])
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

  const handleSaveGroup = async (
    group: ChromeTabGroup,
    tabs: ChromeTab[],
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!currentSpace?.id || !tabs.length) return;
    const title = group.title || 'Tab group';
    const newCollection = await chrome.bookmarks.create({
      parentId: currentSpace.id,
      title,
      index: 0,
    });
    await Promise.all(
      tabs
        .filter((tab) => tab.url)
        .map((tab) =>
          chrome.bookmarks.create({
            parentId: newCollection.id,
            title: tab.title || 'New Tab',
            url: tab.url!,
          })
        )
    );
    refresh();
  };

  const renderOrderedTabs = () => {
    const rendered: JSX.Element[] = [];
    let index = 0;
    while (index < filteredTabs.length) {
      const tab = filteredTabs[index];
      const group = tab.groupId >= 0 ? groupById.get(tab.groupId) : undefined;
      if (!group) {
        rendered.push(<Tab key={tab.id} tab={tab} />);
        index += 1;
        continue;
      }

      const groupTabs: ChromeTab[] = [];
      while (
        index < filteredTabs.length &&
        filteredTabs[index].groupId === group.id
      ) {
        groupTabs.push(filteredTabs[index]);
        index += 1;
      }
      rendered.push(
        <section
          key={`${group.id}-${groupTabs[0].id}`}
          className={`tab-group-section tab-group-${group.color}`}
        >
          <div className='tab-group-header'>
            <span className='tab-group-color' aria-hidden='true' />
            <span className='tab-group-name'>{group.title || 'Tab group'}</span>
            <span className='tab-group-count'>{groupTabs.length}</span>
            <IconButton
              className='tab-group-save'
              icon={saveWindowIcon}
              label={`Save ${group.title || 'Tab group'} as collection`}
              disabled={!currentSpace?.id}
              onClick={(event) => handleSaveGroup(group, groupTabs, event)}
            />
          </div>
          <div className='tab-group-tabs'>
            {groupTabs.map((groupTab) => (
              <Tab key={groupTab.id} tab={groupTab} />
            ))}
          </div>
        </section>
      );
    }
    return rendered;
  };

  return (
    <section id='window-container' className='window-card'>
      <div id='window-title-group' className='window-header'>
        <div className='window-title-group'>
          <IconButton
            id='window-expand-button'
            icon={expandWindowIcon}
            label={isExpanded ? 'Collapse window' : 'Expand window'}
            aria-expanded={isExpanded}
            className={isExpanded ? '' : 'is-collapsed'}
            onClick={handleExpandToggel}
          />
          <h3 id='window-title'>Window {props.index}</h3>
          <span className='count-badge'>{filteredTabs.length}</span>
        </div>
        <div id='window-buttons-group' className='window-actions'>
          <IconButton
            id='save-window-button'
            icon={saveWindowIcon}
            label='Save window as collection'
            disabled={!currentSpace || !filteredTabs.length}
            onClick={handleSaveWindow}
          />
          <IconButton
            id='close-window-button'
            icon={closeWindowIcon}
            label='Close window'
            danger
            onClick={handleCloseWindow}
          />
        </div>
      </div>
      {isExpanded && (
        <div id='tab-group' className='tab-list'>
          {filteredTabs.length ? (
            renderOrderedTabs()
          ) : (
            <p className='window-empty'>No tabs to save in this window.</p>
          )}
        </div>
      )}
    </section>
  );
};
export default Window;
