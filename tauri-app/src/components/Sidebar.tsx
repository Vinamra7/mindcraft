import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      {/* <div className="absolute bottom-0 left-0 w-full p-4"> */}
        <Link
          to="/advanced-settings"
          className={`absolute bottom-0 left-0 flex items-center hover:bg-gray-700 p-4 rounded-md transition-all duration-30 justify-start`}
        >
          <Settings className={''} />
          {isOpen && <span className="whitespace-nowrap">&nbsp;Advanced Settings</span>}
        </Link>
      {/* </div> */}
    </div>
  );
};

export default Sidebar;
