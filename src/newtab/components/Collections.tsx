import React, { JSX } from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import Collection from './Collection';

const Collections = (): JSX.Element => {
  const { collections } = useNewTabContext();

  return (
    <div
      id='collection-panel'
      className='flex w-full grow-0 flex-col overflow-y-auto'
    >
      {collections.length !== 0 ? (
        collections.map((collection) => (
          <Collection key={collection.id} collection={collection} />
        ))
      ) : (
        <div id='no-collection-hint' className='px-30 py-20 text-[14px]'>
          No collection
        </div>
      )}
    </div>
  );
};

export default Collections;
