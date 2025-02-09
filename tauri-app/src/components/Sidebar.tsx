import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Settings, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  name: string;
  model: string;
  additionalConfig?: string;
}

interface SidebarProps {
  profiles: Profile[];
  selectedProfiles: Profile[];
  onProfileSelect: (profile: Profile[]) => void;
  onProfileDelete: (profileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ profiles, selectedProfiles, onProfileSelect, onProfileDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (profile: Profile) => {
    const isSelected = selectedProfiles.some((p) => p.name === profile.name);
    let newSelectedProfiles: Profile[] = [];

    if (isSelected) {
      newSelectedProfiles = selectedProfiles.filter((p) => p.name !== profile.name);
    } else {
      newSelectedProfiles = [...selectedProfiles, profile];
    }
    onProfileSelect(newSelectedProfiles);
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

              className={`flex items-center p-4 cursor-pointer hover:bg-gray-700 ${
                selectedProfiles.some((p) => p.name === profile.name) ? 'bg-gray-600' : ''
              }`}
            >              {/* Custom Checkbox */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedProfiles.some((p) => p.name === profile.name)}
                onChange={() => handleCheckboxChange(profile)}
              />
              <span
                className={`mr-2 w-4 h-4 border-2 border-gray-500 rounded flex items-center justify-center transition-colors duration-200
                  ${selectedProfiles.some((p) => p.name === profile.name) ? 'bg-green-600 border-green-600' : 'bg-gray-800'} `}>
              </span>
              <User className="mr-2" />
              {profile.name}
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProfileDelete(profile.name);
              }}
              className="ml-auto hover:bg-red-700 rounded-full p-1"
            >
              <Trash />
            </button>
            </li>
          ))}
      </ul>
      {/* <div className="absolute bottom-0 left-0 w-full p-4"> */}
        <Link
          to="/advanced-settings"
          className={`absolute bottom-0 left-0 flex items-center hover:bg-gray-700 p-4 rounded-md transition-all duration-300 justify-start`}
        >
          <Settings className={''} />
          {isOpen && <span className="whitespace-nowrap">&nbsp;Advanced Settings</span>}
        </Link>
      {/* </div> */}
    </div>
  );
};

export default Sidebar;
