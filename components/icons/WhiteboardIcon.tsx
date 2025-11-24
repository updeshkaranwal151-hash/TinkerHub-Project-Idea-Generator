import React from 'react';

export const WhiteboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-5.247-8.995l10.494 6.002M12 6.253L6.753 9.25m5.247-2.997l5.247 2.997M12 17.747L6.753 14.75m5.247 2.997l5.247-2.997" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-5.25L21 12l-9 5.25L3 12z" />
    </svg>
);