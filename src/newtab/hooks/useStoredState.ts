import { useCallback, useEffect, useRef, useState } from 'react';
import type { BookmarkTreeNode } from '@/types';

/** Store selection IDs, accepting legacy bookmark objects on upgrade. */
export function useStoredState<T extends BookmarkTreeNode | undefined>(
  key: string
) {
  const [value, setValue] = useState<T>();
  const [isLoaded, setIsLoaded] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = (await chrome.storage.local.get(key))[key];
        const id = typeof stored === 'string' ? stored : stored?.id;
        const nodes = id ? await chrome.bookmarks.get(id).catch(() => []) : [];
        if (active) setValue(nodes[0] as T);
      } catch (error) {
        console.error('Could not load selection', error);
      } finally {
        if (active) setIsLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [key]);
  const updateValue = useCallback(
    (next: T | undefined) => {
      setValue(next);
      writeQueue.current = writeQueue.current
        .then(() =>
          next
            ? chrome.storage.local.set({ [key]: next.id })
            : chrome.storage.local.remove(key)
        )
        .catch((error) => console.error('Could not save selection', error));
    },
    [key]
  );
  return [value, updateValue, isLoaded] as const;
}
