import React, { JSX } from 'react';

export default function NewTab(): JSX.Element {
    return (
        <div id='my-ext' data-theme='light'>
            <div id='main-container' className='h-screen flex bg-black'>
                <div id='workspace-container' className='h-full flex-1 bg-red-400' />
                <div id='space-container' className='h-full flex-1 bg-green-400' />
                <div id='collection-container' className='h-full flex-1 bg-pink-400' />
                <div id='tab-container' className='h-full flex-1 bg-blue-400' />

            </div>
        </div>
    );
}
