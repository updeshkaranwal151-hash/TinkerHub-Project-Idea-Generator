import React from 'react';

const Spinner: React.FC<{ size?: number }> = ({ size = 5 }) => {
  return (
    <div 
        className={`w-${size} h-${size} border-2 border-dashed rounded-full animate-spin border-white`}
        style={{ borderColor: 'currentColor' }}
    ></div>
  );
};

export default Spinner;