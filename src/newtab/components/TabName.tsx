import React from 'react';
export default function TabName() {
  return <header id='tab-name-panel' className='tabs-heading'>
    <div><span className='eyebrow'>RIGHT NOW</span><h2 id='tab-name'>Open tabs</h2></div>
    <span className='live-badge'><span className='status-dot' />Live</span>
  </header>;
}
