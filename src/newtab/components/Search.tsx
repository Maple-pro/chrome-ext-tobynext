import React, { JSX, useState } from 'react';
import searchIcon from '@assets/search.svg';

import SearchModal from '../modals/SearchModal';

const Search = (): JSX.Element => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      id='search-container'
      onClick={() => {
        setIsSearchOpen(true);
      }}
      className='border-toby-outline-gray flex h-50 w-full flex-none cursor-pointer items-center justify-start border-b-1 border-solid pt-20 pb-20 pl-12 text-[14px]'
    >
      <div id='search-icon' className='mr-10'>
        <img src={searchIcon} className='h-15 w-15' />
      </div>
      <div id='search-text'>Search</div>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Search;
