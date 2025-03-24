type ChromeWindow = chrome.windows.Window;

export default async (setWindows: Function) => {
    console.log("fetch all windows");
    const windows = await new Promise<ChromeWindow[]>(resolve => {
        chrome.windows.getAll({}, resolve);
    });

    setWindows(windows);
}

