import React, { JSX } from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import Collection from './Collection';
import folderIcon from '@assets/folder.svg';

const Collections = (): JSX.Element => {
  const { collections } = useNewTabContext();

  return (
    <div
      id='collection-panel'
      className='collection-panel'
    >
      {collections.length !== 0 ? (
        collections.map((collection) => (
          <Collection key={collection.id} collection={collection} />
        ))
      ) : (
        <div id='no-collection-hint' className='library-empty'>
          <div className='empty-icon'><img src={folderIcon} alt='' /></div>
          <h2>A little space for your tabs</h2>
          <p>Create your first collection, then drag tabs from the right to keep them here.</p>
          <span className='empty-hint'>Start with “New collection” above <span aria-hidden='true'>↗</span></span>
        </div>
      )}
    </div>
  );
};

export default Collections;
