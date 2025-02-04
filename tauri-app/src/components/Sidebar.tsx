import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface Profile {
  name: string;
  modelType: string;
}

interface SidebarProps {
  profiles: Profile[];
  selectedProfile: Profile | null;
  onProfileSelect: (profile: Profile | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ profiles, selectedProfile, onProfileSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`bg-gray-800 text-gray-100 h-full transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        {isOpen && <h2 className="text-lg font-semibold">Profiles</h2>}
        <button onClick={toggleSidebar} className="hover:bg-gray-700 rounded-full p-1">
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      <ul className="flex flex-col">
        {isOpen &&
          profiles.map((profile, index) => (
            <li
              key={index}
              onClick={() => onProfileSelect(profile)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-700 ${
                selectedProfile?.name === profile.name ? 'bg-gray-600' : ''
              }`}
            >
              <User className="mr-2" />
              {profile.name}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
