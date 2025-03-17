import React, { JSX } from 'react';

export default function NewTab(): JSX.Element {
    return (
        <div id='my-ext' data-theme='light'>
            <div id='main-container' className='h-screen w-screen flex bg-#FAFAFA'>
                <div id="navigation-panel-group" className='h-full flex-none basis-290 flex'>
                    <div id='workspace-container' className='h-full flex-none basis-70 py-16 bg-yellow-50' />
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
