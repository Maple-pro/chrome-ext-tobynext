import React from 'react';

export default function Popup() {
  return (
    <div className='w-220 p-16' data-theme='light'>
      <h1 className='mb-12 text-[18px]'>Toby Next</h1>
      <button
        type='button'
        className='bg-toby-blue cursor-pointer rounded-md px-12 py-8 text-white'
        onClick={() =>
          chrome.tabs.create({
            url: chrome.runtime.getURL('src/newtab/index.html'),
          })
        }
      >
        Open tab manager
      </button>
    </div>
  );
}
