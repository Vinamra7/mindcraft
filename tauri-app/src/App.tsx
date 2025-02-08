import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ApiKeyPage from './components/ApiKeyPage';
import ProfilePage from './components/ProfilePage';
import Sidebar from './components/Sidebar';
import AdvancedSettingsPage from './components/AdvancedSettingsPage';
import toast, { Toaster } from 'react-hot-toast';
import { mkdir, exists, BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';

interface Profile {
  name: string;
  model: string;
  additionalConfig?: string;
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const handleProfileSelect = (profile: Profile | null) => {
    setSelectedProfile(profile);
  };

  const uploadNewProfile = async(profile: Profile) =>{
    try{
      // Ensure directory exists
      if (!(await exists('', { baseDir: BaseDirectory.AppData }))) {
        await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
      }
      await writeTextFile(`${profile.name}.json`, JSON.stringify(profile), { baseDir: BaseDirectory.AppData });
    } catch(error){
      console.error('Error loading saved keys:', error);
    }
  }

  useEffect(() => {
    console.log('Profiles changed: ', profiles);
    if(profiles.length === 0){return;}
    const newProfile = profiles.at(-1);
    if (!newProfile) {
      toast.error('Failed to add profile. Please try again.');
      return;
    }
    
    for(let i: number = 0; i< profiles.length - 1; i++) {
      const profile: Profile = profiles[i];
      if (profile.name === newProfile.name) {
        toast.error('Profile with the same name already exists.');
        setProfiles(profiles.slice(0, -1));
        return;
      }
    };
    toast.promise(uploadNewProfile(newProfile), {
      loading: 'Saving profile...',
      success: 'Profile saved successfully.',
      error: 'Failed to save profile. Please try again.'
    });
  }, [profiles]);

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Toaster />
        <Sidebar
          profiles={profiles}
          selectedProfile={selectedProfile}
          onProfileSelect={handleProfileSelect}
        />
        <div className="flex-1 flex flex-col items-center pt-10 overflow-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <Routes>
              <Route
                path="/"
                element={<HomePage selectedProfile={selectedProfile} />}
              />
              <Route path="/api-key" element={<ApiKeyPage />} />
              <Route
                path="/profile"
                element={<ProfilePage setProfiles={setProfiles} />}
              />
              <Route path="/advanced-settings" element={<AdvancedSettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
