import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sampleBotProfile from './sampleBotProfile.json';

interface Profile {
  name: string;
  modelType: string;
  additionalConfig?: string;
}

interface ProfilePageProps {
  setProfiles:  React.Dispatch<React.SetStateAction<Profile[]>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setProfiles }) => {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState<'simple' | 'advanced'>('simple'); // 'simple' or 'advanced'
  const [botName, setBotName] = useState('');
  const [modelType, setModelType] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'bot-name') {
      setBotName(e.target.value);
    } else if (e.target.name === 'model-type') {
      setModelType(e.target.value);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          JSON.parse(text); // Validate JSON
          setFileContent(text);
          setUploadError(null);
        } catch (error) {
          setFileContent(null);
          setUploadError("Invalid JSON file. Please upload a valid JSON file.");
          console.error("Error parsing JSON:", error);
        }
      };
      reader.onerror = () => {
        setUploadError("Failed to read file. Please try again.");
        setFileContent(null);
      };
      reader.readAsText(file);
    } else {
      setFileName(null);
      setFileContent(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputMethod === 'advanced' && fileContent) {
      try {
        const profile = JSON.parse(fileContent);
        setProfiles((prevProfiles) => [...prevProfiles, profile]);
        navigate('/');
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setUploadError("Invalid JSON data in file. Please check the file content.");
        return;
      }
    } else if (inputMethod === 'simple' && botName && modelType) {
      const newProfile: Profile = { name: botName, modelType };
      setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
      navigate('/');
    } else {
      // Handle cases where form is incomplete.
      if (inputMethod === 'simple') {
          setUploadError("Please enter both bot name and model type.");
      }
    }
  };

  const downloadSample = () => {
    const sampleProfileString = JSON.stringify(sampleBotProfile, null, 2);
    const blob = new Blob([sampleProfileString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'sampleBotProfile.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add Bot Profile</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Input Method:
        </label>
        <div className="mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600"
              value="simple"
              checked={inputMethod === 'simple'}
              onChange={() => setInputMethod('simple')}
            />
            <span className="ml-2 text-gray-200">Simple</span>
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600"
              value="advanced"
              checked={inputMethod === 'advanced'}
              onChange={() => setInputMethod('advanced')}
            />
            <span className="ml-2 text-gray-200">Advanced (JSON Upload)</span>
          </label>
        </div>
      </div>

      {inputMethod === 'advanced' && (
        <div className="mb-4">
          <button
            type="button"
            onClick={downloadSample}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Sample Profile
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {inputMethod === 'simple' && (
          <>
            <div className="mb-4">
              <label htmlFor="bot-name" className="block text-sm font-medium text-gray-300">
                Bot Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="bot-name"
                  id="bot-name"
                  className="input-box w-full"
                  placeholder="Enter bot name"
                  value={botName}
                  onChange={handleInputChange}
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
                  className="input-box w-full"
                  placeholder="Enter model type"
                  value={modelType}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </>
        )}

        {inputMethod === 'advanced' && (
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300">
              Upload Bot Profile (JSON)
            </label>
            <div className="mt-1">
              <input
                type="file"
                name="file-upload"
                id="file-upload"
                accept=".json"
                className="input-box w-full"
                onChange={handleFileChange}
              />
            </div>
            {fileName && <p className="text-sm text-gray-300">Selected File: {fileName}</p>}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Bot Profile
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

export default ProfilePage;
