import React from 'react';
import helpIcon from '@assets/help.svg';
import IconButton from './IconButton';
export default function Help() {
  return <IconButton icon={helpIcon} label='Help & documentation'
    onClick={() => window.open('http://sites.maples31.com/tobynext/', '_blank', 'noopener')} />;
}
