import React, { useRef, useState } from 'react';
import searchIcon from '@assets/search.svg';

import Modal from './Modal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<chrome.bookmarks.BookmarkTreeNode[]>(
    []
  );

  const revision = useRef(0);

  if (!isOpen) {
    return null;
  }

  // search bookmarks
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const current = ++revision.current;
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
      setResults([]);
      return;
    }

    chrome.bookmarks.search(value, (bookmarks) => {
      if (current === revision.current)
        setResults(bookmarks.filter((bookmark) => !!bookmark.url));
    });
  };

  return (
    <Modal onClose={onClose} label='Search'>
      <div
        id='search-modal-container'
        className='bg-toby-bg-gray relative flex max-h-[calc(100vh-100px)] w-700 flex-col rounded-md border border-gray-200 px-16 py-24 shadow-md'
      >
        <div
          id='input-container'
          className='flex h-80 flex-none flex-row items-center justify-center'
        >
          <div id='search-icon' className='mr-10 h-30 w-30'>
            <img src={searchIcon} />
          </div>
          <input
            type='text'
            value={query}
            onChange={handleSearch}
            className='h-32 w-full rounded-md border border-gray-300 px-10 text-[20px] leading-[30px] focus:ring-2 focus:ring-blue-400 focus:outline-none'
            placeholder='Search bookmarks...'
          />
        </div>
        <div
          id='result-container'
          className='mt-4 max-h-[calc(100vh-250px)] w-full overflow-y-auto'
        >
          {results.length > 0 ? (
            results.map((bookmark) => (
              <div
                key={bookmark.id}
                onClick={() => window.open(bookmark.url, '_blank')}
                className='border-toby-outline-gray shadow-toby-outline-gray my-10 flex cursor-pointer flex-col rounded-md border-1 border-solid px-16 py-10 shadow-sm hover:bg-gray-100'
              >
                <div
                  id='bookmark-title'
                  className='w-full truncate text-[14px]'
                >
                  {bookmark.title}
                </div>
                <div
                  id='bookmark-url'
                  className='w-full truncate text-[12px] font-light'
                >
                  {bookmark.url}
                </div>
              </div>
            ))
          ) : (
            <p className='text-[14px] text-gray-500'>No results found</p>
          )}
        </div>
        <button
          onClick={() => onClose()}
          className='text-toby-blue mx-auto mt-10 h-30 w-1/2 flex-none cursor-pointer rounded-md px-4 py-2 font-bold'
        >
          CLOSE
        </button>
      </div>
    </Modal>
  );
};

export default SearchModal;
