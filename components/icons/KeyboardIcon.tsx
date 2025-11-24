import React from 'react';

export const KeyboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17l4 4 4-4m-4-5v9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.385 6.585a2.1 2.1 0 00-2.97-2.97L9 12v3h3l8.385-8.415zM4 17h4" />
    </svg>
);