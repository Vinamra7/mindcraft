import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  name: string;
  modelType: string;
  additionalConfig?: string;
}

interface ProfilePageProps {
  setProfiles: (profiles: Profile[]) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setProfiles }) => {
  const navigate = useNavigate();
  const [botName, setBotName] = useState('');
  const [modelType, setModelType] = useState('');
  const [additionalConfig, setAdditionalConfig] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newProfile: Profile = { name: botName, modelType, additionalConfig };
    setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
    console.log('Bot Name:', botName);
    console.log('Model Type:', modelType);
    console.log('Additional Config:', additionalConfig);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Add Bot Profile</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
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
              className="input-box w-full"
              placeholder="Enter model type"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="additional-config" className="block text-sm font-medium text-gray-300">
            Additional Config (optional)
          </label>
          <div className="mt-1">
            <textarea
              name="additional-config"
              id="additional-config"
              className="input-box w-full"
              placeholder="Enter additional configuration"
              value={additionalConfig}
              onChange={(e) => setAdditionalConfig(e.target.value)}
            />
          </div>
        </div>
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
