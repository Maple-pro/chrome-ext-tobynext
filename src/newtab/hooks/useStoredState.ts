import { useEffect, useState } from "react";

export function useStoredState<T>(key: string, defaultValue?: T) {
    const [value, setValue] = useState<T | undefined>(defaultValue);

    useEffect(() => {
        chrome.storage.local.get([key], (result) => {
            setValue(result[key]);
            console.log("load %s: %s", key, result[key] ? result[key].title : undefined);
        });
    }, [key]);

    const updateValue = (newValue: T | undefined) => {
        setValue(newValue);
        chrome.storage.local.set({ [key]: newValue });
        console.log("store %s: %s", key, newValue ? (newValue as unknown as chrome.bookmarks.BookmarkTreeNode).title : undefined );
    };

    return [value, updateValue] as const;
}