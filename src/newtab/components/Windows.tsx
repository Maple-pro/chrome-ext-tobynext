import React, { JSX } from 'react';

import { useWindows } from '../hooks/useWindows';
import Window from './Window';

const Windows = (): JSX.Element => {
  const { windows, error } = useWindows();

  return (
    <div
      id='windows-panel'
      className='windows-panel'
    >
      {error && <p role='alert'>{error}</p>}
      {windows.map((window, index) => (
        <Window key={window.id} window={window} index={index + 1} />
      ))}
    </div>
  );
};

export default Windows;
