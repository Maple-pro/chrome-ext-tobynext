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
      <div id='search-modal-container' className='modal-content search-modal'>
        <h2>Find a saved tab</h2>
        <div id='input-container' className='search-input-row'>
          <img src={searchIcon} alt='' />
          <input type='search' value={query} onChange={handleSearch} autoFocus
            className='modal-input' aria-label='Search bookmarks' placeholder='Search by title or URL…' />
        </div>
        <div id='result-container' className='search-results'>
          {results.length ? results.map(bookmark => <a key={bookmark.id} className='search-result'
            href={bookmark.url} target='_blank' rel='noopener noreferrer'>
            <span className='bookmark-title'>{bookmark.title}</span><span className='bookmark-url'>{bookmark.url}</span>
          </a>) : <p className='search-empty'>{query.trim() ? 'No bookmarks found. Try a different search.' : 'Search across all your saved bookmarks.'}</p>}
        </div>
        <div className='modal-actions'><button type='button' onClick={onClose} className='secondary-button'>CLOSE</button></div>
      </div>
    </Modal>
  );
};
export default SearchModal;
