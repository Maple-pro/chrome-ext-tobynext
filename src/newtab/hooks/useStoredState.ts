import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, defaultValue?: T) {
    const [value, setValue] = useState<T | undefined>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadBookmarkFromStorage = async () => {
            try {
                const stored = await chrome.storage.local.get([key]);
                if (stored[key]) {
                    const existingBookmarks = await chrome.bookmarks.get(stored[key].id).catch(() => null);
                    if (existingBookmarks && existingBookmarks.length > 0) {
                        setValue(stored[key]);
                        console.log("load %s: %s", key, stored[key] ? stored[key].title : undefined);
                    } else {
                        console.warn("Stored bookmark no longer exists: " + stored[key].title);
                        setValue(undefined);
                    }
                }
            } catch (error) {
                console.error("Failed to load workspace from chrome storage: ", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadBookmarkFromStorage();

    }, [key]);

    const updateValue = (newValue: T | undefined) => {
        setValue(newValue);
        chrome.storage.local.set({ [key]: newValue });
        console.log("store %s: %s", key, newValue ? (newValue as unknown as chrome.bookmarks.BookmarkTreeNode).title : undefined );
    };

    return [value, updateValue, isLoaded] as const;
}