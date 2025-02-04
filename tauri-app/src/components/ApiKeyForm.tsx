import React, { useState } from 'react';

const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle API key storage
    console.log('API Key:', apiKey);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">
        API Key
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="api-key"
          id="api-key"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-600 rounded-md bg-gray-800 text-gray-200 p-2"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save API Key
      </button>
    </form>
  );
};

export default ApiKeyForm;
