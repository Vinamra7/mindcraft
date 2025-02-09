import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, UserRound } from 'lucide-react';
import StartButton from './StartButton';
import TaskSection from './TaskSection';

interface Profile {
  name: string;
  model: string;
  additionalConfig?: string;
}

interface HomePageProps {
  selectedProfiles: Profile[];
}

const HomePage: React.FC<HomePageProps> = ({ selectedProfiles }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">MINDCRAFT</h1>
      <div className="flex space-x-4 mb-6">
        <Link to="/api-key" className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md">
          <KeyRound className="mr-2" />
          API
        </Link>
        <Link to="/profile" className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md">
          <UserRound className="mr-2" />
          Profile
        </Link>
      </div>
      <div className="bg-black bg-opacity-50 p-4 rounded-lg w-full max-w-md mb-6">
        <p className={selectedProfiles.length > 0 ? 'text-green-400' : 'text-red-500'}>
          Current Profile: {' '}
          {selectedProfiles.length > 0 ? 
            selectedProfiles.map((profile) => profile.name).join(', ') : 'None'}
        </p>
      </div>
      <StartButton disabled={selectedProfiles.length === 0} />
      <TaskSection />
    </div>
  );
};

export default HomePage;
