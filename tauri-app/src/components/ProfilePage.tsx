import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sampleBotProfile from './sampleBotProfile.json';

interface Profile {
  name: string;
  model: string;
  additionalConfig?: string;
}

interface ProfilePageProps {
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setProfiles }) => {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState<'simple' | 'advanced'>('simple');
  const [botName, setBotName] = useState('');
  const [modelType, setModelType] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'bot-name') setBotName(value);
    if (name === 'model-type') setModelType(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      setFileContent(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        JSON.parse(text); // validate JSON
        setFileContent(text);
        setError(null);
      } catch {
        setFileContent(null);
        setError("Invalid JSON file. Please upload a valid JSON file.");
      }
    };
    reader.onerror = () => {
      setFileContent(null);
      setError("Failed to read file. Please try again.");
    };
    reader.readAsText(file);
  };

  const botNamesThatAreNotAllowed = (name: string) => {
    // keys.json hold api key
    return name.toLowerCase() === 'keys' || name.toLowerCase() === 'settings';
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (inputMethod === 'advanced') {
      if (!fileContent) return setError("Please upload a valid JSON file.");
      try {
        const profile = JSON.parse(fileContent);
        //keys.json hold api key ans settings.json hold settings
        if(botNamesThatAreNotAllowed(profile.name)) return setError(`Bot name cannot be ${profile.name}`);
        setProfiles((prev) => [...prev, profile]);
      } catch {
        setError("Invalid JSON data in file. Please check the file content.");
      }
    } else {
      if (!botName || !modelType)
        return setError("Please enter both bot name and model type.");
      if(botNamesThatAreNotAllowed(botName)) return setError(`Bot name cannot be ${botName}`);
      setProfiles((prev) => [...prev, { name: botName, model: modelType }]);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(sampleBotProfile, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sampleBotProfile.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add Bot Profile</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">Input Method:</label>
        <div className="mt-1">
          {['simple', 'advanced'].map((method) => (
            <label key={method} className="inline-flex items-center mr-6">
              <input
                type="radio"
                value={method}
                checked={inputMethod === method}
                onChange={() => {
                  setInputMethod(method as 'simple' | 'advanced');
                  setError(null);
                }}
                className="form-radio h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-200">
                {method === 'simple' ? 'Simple' : 'Advanced (JSON Upload)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {inputMethod === 'advanced' && (
        <div className="mb-4">
          <button
            type="button"
            onClick={downloadSample}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-indigo-600 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Sample Profile
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {inputMethod === 'simple' ? (
          <>
            <div className="mb-4">
              <label htmlFor="bot-name" className="block text-sm font-medium text-gray-300">
                Bot Name
              </label>
              <input
                type="text"
                name="bot-name"
                id="bot-name"
                placeholder="Enter bot name"
                value={botName}
                onChange={handleInputChange}
                className="input-box w-full mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="model-type" className="block text-sm font-medium text-gray-300">
                Model Type
              </label>
              <input
                type="text"
                name="model-type"
                id="model-type"
                placeholder="Enter model type"
                value={modelType}
                onChange={handleInputChange}
                className="input-box w-full mt-1"
              />
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300">
              Upload Bot Profile (JSON)
            </label>
            <input
              type="file"
              id="file-upload"
              accept=".json"
              onChange={handleFileChange}
              className="input-box w-full mt-1"
            />
            {fileName && <p className="text-sm text-gray-300 mt-1">Selected File: {fileName}</p>}
          </div>
        )}

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Bot Profile
          </button>
        </div>
      </form>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
