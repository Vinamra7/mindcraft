import React from 'react';

interface StartButtonProps {
  disabled?: boolean;
  isRunning?: boolean;
  onClick: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ disabled = false, isRunning ,onClick }) => {
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : isRunning ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'
      }`}//'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
    >
      {isRunning ? 'Stop' : 'Start'}
    </button>
  );
};

export default StartButton;
