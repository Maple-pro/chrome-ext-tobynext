import React from 'react';
import styles from '@assets/styles/index.css?inline';
import createShadowRoot from '@utils/createShadowRoot';

import NewTab from './NewTab';

const root = createShadowRoot(styles)

root.render(<NewTab />);
