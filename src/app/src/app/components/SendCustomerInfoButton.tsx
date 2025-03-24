import React from 'react';

interface SendCustomerInfoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const SendCustomerInfoButton: React.FC<SendCustomerInfoButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
    >
      Send Customer Info
    </button>
  );
}; 