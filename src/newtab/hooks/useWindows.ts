import { useEffect, useState } from 'react';
import type { ChromeTabGroup, OpenTabsWindow } from '@/types';

export function useWindows() {
  const [windows, setWindows] = useState<OpenTabsWindow[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const current = ++revision;
      try {
        const result = await chrome.windows.getAll({
          populate: true,
          windowTypes: ['normal'],
        });
        const withGroups = await Promise.all(
          result.map(async (window) => {
            const groupIds = [
              ...new Set(
                (window.tabs ?? [])
                  .map((tab) => tab.groupId)
                  .filter((groupId): groupId is number => groupId >= 0)
              ),
            ];
            const tabGroups = await Promise.all(
              groupIds.map(
                async (groupId): Promise<ChromeTabGroup | undefined> => {
                  try {
                    return await chrome.tabGroups.get(groupId);
                  } catch {
                    return undefined;
                  }
                }
              )
            );
            return {
              ...window,
              tabGroups: tabGroups.filter((group): group is ChromeTabGroup =>
                Boolean(group)
              ),
            };
          })
        );
        if (active && current === revision) {
          setWindows(withGroups);
          setError('');
        }
      } catch (reason) {
        if (active && current === revision) setError(String(reason));
      }
    };
    const changed = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 80);
    };
    const events = [
      chrome.tabs.onUpdated,
      chrome.tabs.onRemoved,
      chrome.tabs.onCreated,
      chrome.tabs.onMoved,
      chrome.tabs.onAttached,
      chrome.tabs.onDetached,
      chrome.tabs.onActivated,
      chrome.tabGroups.onCreated,
      chrome.tabGroups.onUpdated,
      chrome.tabGroups.onRemoved,
      chrome.windows.onCreated,
      chrome.windows.onRemoved,
    ];
    events.forEach((event) => event.addListener(changed));
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
      events.forEach((event) => event.removeListener(changed));
    };
  }, []);
  return { windows, error };
}
