import React, { JSX, useEffect, useState } from 'react';
import findRootFolder from './utils/findRootFolder';
import Workspaces from './components/Workspaces';

type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;


export default function NewTab(): JSX.Element {
    let [rootFolder, setRootFolder] = useState<BookmarkTreeNode | undefined>();
    let [workspaces, setWorkspaces] = useState<JSX.Element>();

    useEffect(() => {
        const fetchRootFolder = async () => {
            const folder = await findRootFolder();
            setRootFolder(folder);
            console.log("Find root folder: " + folder.title);
        };

        fetchRootFolder();
    }, []);

    useEffect(() => {
        if (rootFolder) {
            console.log("start to init workspaces");
            setWorkspaces(<Workspaces folder={rootFolder} />);
            console.log("workspaces: " + workspaces);
        }
    }, [rootFolder]);

    return (
        <div id='my-ext' data-theme='light'>
            <div id='main-container' className='h-screen w-screen flex bg-#FAFAFA'>
                <div id="navigation-panel-group" className='h-full flex-none basis-290 flex'>
                    <div id='workspace-container' className='h-full flex-none basis-70 py-16 bg-yellow-50 flex flex-col'>
                        {workspaces}
                        <div id="add-btns-container">

                        </div>
                    </div>
                    <div id='space-container' className='h-full flex-none basis-220 border-x-1 border-solid border-#DDDDF5 bg-red-50' />
                </div>
                <div id="data-panel-group" className='h-full w-10 flex-auto flex'>
                    <div id='collection-container' className='h-full grow-85 shrink border-r-1 border-solid border-#DDDDF5 bg-green-50' />
                    <div id='tab-container' className='h-full grow-15 shrink bg-blue-50' />

                </div>

            </div>
        </div>
    );
}
