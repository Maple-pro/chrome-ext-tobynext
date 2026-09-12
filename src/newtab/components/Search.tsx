import React, { JSX, useState } from 'react';
import searchIcon from '@assets/search.svg';

import SearchModal from '../modals/SearchModal';

const Search = (): JSX.Element => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return <>
    <button type='button' id='search-container' className='search-trigger' onClick={() => setIsSearchOpen(true)}>
      <img src={searchIcon} alt='' /><span>Search bookmarks</span>
    </button>
    {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
  </>;
};
export default Search;
