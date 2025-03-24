type ChromeWindow = chrome.windows.Window;

export default async (setWindows: Function) => {
    const windows = await new Promise<ChromeWindow[]>(resolve => {
        chrome.windows.getAll({}, resolve);
    });

    setWindows(windows);
}

