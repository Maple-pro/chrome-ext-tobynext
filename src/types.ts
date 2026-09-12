export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
export type ChromeWindow = chrome.windows.Window;
export type ChromeTab = chrome.tabs.Tab;
export type ChromeTabGroup = chrome.tabGroups.TabGroup;

export type OpenTabsWindow = ChromeWindow & {
  tabGroups: ChromeTabGroup[];
};
