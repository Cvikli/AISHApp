import React from 'react';

const AutoExecuteIcon = ({ color = 'currentColor', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="4" height="4" fill={color} />
    <rect x="8" y="4" width="4" height="4" fill={color} />
    <rect x="12" y="4" width="4" height="4" fill={color} />
    <rect x="16" y="4" width="4" height="4" fill={color} />
    <rect x="4" y="8" width="4" height="4" fill={color} />
    <rect x="8" y="8" width="4" height="4" fill={color} />
    <rect x="12" y="8" width="4" height="4" fill={color} />
    <rect x="4" y="12" width="4" height="4" fill={color} />
    <rect x="8" y="12" width="4" height="4" fill={color} />
    <rect x="4" y="16" width="4" height="4" fill={color} />
    <rect x="12" y="16" width="4" height="4" fill={color} />
    <rect x="16" y="16" width="4" height="4" fill={color} />
  </svg>
);

export default AutoExecuteIcon;