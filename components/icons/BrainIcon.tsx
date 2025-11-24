import React from 'react';

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 10.395c.57-2.934 3.235-5.395 6.129-5.395s5.559 2.461 6.129 5.395m-12.258 0C3.79 12.015 3 13.91 3 16c0 3.314 2.686 6 6 6s6-2.686 6-6c0-2.09-0.79-3.985-1.871-5.605m-12.258 0c.346-1.043 1.13-1.928 2.15-2.529C9.282 7.27 10.6 7 12 7s2.718 0.27 3.971 0.866c1.02 0.601 1.804 1.486 2.15 2.529m-12.258 0h12.258" />
  </svg>
);