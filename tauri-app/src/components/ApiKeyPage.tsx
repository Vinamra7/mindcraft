import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mkdir, exists, BaseDirectory, create, readTextFile } from '@tauri-apps/plugin-fs';

const providers = [
  "OPENAI API",
  "OPENAI ORG",
  "GEMINI",
  "ANTHROPIC",
  "REPLICATE",
  "GROQ CLOUD",
  "HUGGINGFACE",
  "QWEN",
  "XAI",
  "MISTRAL",
  "DEEPSEEK"
];

const ApiKeyPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try{
      // Ensure directory exists
      if (!(await exists('', { baseDir: BaseDirectory.AppData }))) {
        await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
      }

      // Define the mapping between provider names and key names
      const providerToKeyName: { [key: string]: string } = {
        "OPENAI API": "OPENAI_API_KEY",
        "OPENAI ORG": "OPENAI_ORG_ID",
        "GEMINI": "GEMINI_API_KEY",
        "ANTHROPIC": "ANTHROPIC_API_KEY",
        "REPLICATE": "REPLICATE_API_KEY",
        "GROQ CLOUD": "GROQCLOUD_API_KEY",
        "HUGGINGFACE": "HUGGINGFACE_API_KEY",
        "QWEN": "QWEN_API_KEY",
        "XAI": "XAI_API_KEY",
        "MISTRAL": "MISTRAL_API_KEY",
        "DEEPSEEK": "DEEPSEEK_API_KEY"
      };

      let existingKeys: { [key: string]: string } = {};
    
      // Try to read existing keys if file exists
      if (await exists('keys.json', { baseDir: BaseDirectory.AppData })) {
        const existingContent = await readTextFile('keys.json', { baseDir: BaseDirectory.AppData });
        if (existingContent) {
          existingKeys = JSON.parse(existingContent);
        }
      }
  
      // Update the specific key while preserving others
      const keyName = providerToKeyName[selectedProvider];
      existingKeys[keyName] = apiKey;
  
      // Create or overwrite the file with updated content
      const file = await create('keys.json', { baseDir: BaseDirectory.AppData });
      await file.write(new TextEncoder().encode(JSON.stringify(existingKeys, null, 4)));
      await file.close();
  
      // Optional: Show success message
      alert('API key saved successfully!');
      
      // Clear the input
      setApiKey('');

    }catch(error){
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add API Key</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="provider" className="block text-sm font-medium text-gray-300">
            Provider
          </label>
          <select
            id="provider"
            name="provider"
            className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">
            API Key
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="api-key"
              id="api-key"
              className="input-box w-full"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save API Key
          </button>
        </div>
      </form>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ApiKeyPage;
