type ChromeTab = chrome.tabs.Tab;

export default async (windowId: number, setTabs: Function) => {
    const tabs = await new Promise<ChromeTab[]>(resolve => {
        chrome.tabs.query({
            windowId: windowId,
        }, resolve);
    });

    console.log(tabs);

    setTabs(tabs);
}