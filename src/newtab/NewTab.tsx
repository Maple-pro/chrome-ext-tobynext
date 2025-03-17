import React, { JSX } from 'react';

export default function NewTab(): JSX.Element {
    return (
        <div id='my-ext' data-theme='light'>
            <div id='main-container' className='h-screen w-screen flex bg-#FAFAFA'>
                <div id="navigation-panel-group" className='h-full w-290 flex-1 flex'>
                    <div id='workspace-container' className='h-full w-70 flex-1 py-16px bg-black' />
                    <div id='space-container' className='h-full w-220 flex-1 border-x-1 border-solid border-#DDDDF5 bg-red-500' />
                </div>
                <div id="data-panel-group" className='h-full w-10 flex-auto flex'>
                    <div id='collection-container' className='h-full grow-85 shrink border-r-1 border-solid border-#DDDDF5' />
                    <div id='tab-container' className='h-full grow-15 shrink' />

                </div>

            </div>
        </div>
    );
}
