import { useEffect, useState } from 'react';
import type { ChromeWindow } from '@/types';

export function useWindows() {
  const [windows, setWindows] = useState<ChromeWindow[]>([]);
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
        if (active && current === revision) {
          setWindows(result);
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
