import React, { useState } from 'react';

const BotProfileForm: React.FC = () => {
  const [botName, setBotName] = useState('');
  const [modelType, setModelType] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle bot profile storage
    console.log('Bot Name:', botName);
    console.log('Model Type:', modelType);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-4">
        <label htmlFor="bot-name" className="block text-sm font-medium text-gray-300">
          Bot Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="bot-name"
            id="bot-name"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-800 text-gray-200 p-2"
            placeholder="Enter bot name"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="model-type" className="block text-sm font-medium text-gray-300">
          Model Type
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="model-type"
            id="model-type"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-800 text-gray-200 p-2"
            placeholder="Enter model type"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save Bot Profile
      </button>
    </form>
  );
};

export default BotProfileForm;
