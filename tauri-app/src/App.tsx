import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ApiKeyPage from './components/ApiKeyPage';
import ProfilePage from './components/ProfilePage';
import Sidebar from './components/Sidebar';
import AdvancedSettingsPage from './components/AdvancedSettingsPage';
import toast, { Toaster } from 'react-hot-toast';
import { mkdir, exists, BaseDirectory, writeTextFile, readTextFile, readDir, remove } from '@tauri-apps/plugin-fs';
import {ask} from '@tauri-apps/plugin-dialog';

interface ModelConfig {
  api: string;
  url: string;
  model: string;
}

interface Profile {
  name: string;
  model: string | ModelConfig;
  embedding?: string | ModelConfig;
  additionalConfig?: string;
}

// ☠️ There are 2 useEffects in this component be careful, changes can cause infinite loop or race conditions

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  // const [effectLock, setEffectLock] = useState(false); // To prevent race condition of useEffect

  const handleProfileSelect = (profiles: Profile[]) => {
    setSelectedProfiles(profiles);
  };

  const handleProfileDelete = async (profileName: string) => {

    const confirm = await ask(`Are you sure you want to delete profile ${profileName}?`,{
      title: `Delete Profile`,
      kind: `warning`,
    });
    if(!confirm){return;}
    await toast.promise(
      remove(`${profileName}.json`, { baseDir: BaseDirectory.AppData }),
      {
        loading: 'Deleting profile...',
        success: 'Profile deleted successfully.',
        error: 'Failed to delete profile. Please try again.',
      }
    );
    setProfiles(profiles => profiles.filter((profile) => profile.name !== profileName));

    // If deleted profile was aldo selected
    setSelectedProfiles(selectedProfiles => selectedProfiles.filter((profile) => profile.name !== profileName));

  }

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

  const prevProfilesLength = useRef(profiles.length);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        // Check if directory exists
        if (!(await exists('', { baseDir: BaseDirectory.AppData }))) {
          await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
          return; // Exit if directory was just created (will be empty)
        }
        const entries = await readDir('', { baseDir: BaseDirectory.AppData });
        
        const loadedProfiles: Profile[] = [];
        for (const entry of entries) {
          if (!entry.name || !entry.name.endsWith('.json') ||  entry.name === 'keys.json' || entry.name === 'settings.json') continue;
          try {
            const fileContent = await readTextFile(entry.name, { baseDir: BaseDirectory.AppData });
            const profile = JSON.parse(fileContent) as Profile;
            
            // Validate profile structure
            if (profile.name && profile.model) loadedProfiles.push(profile);
            
          } catch (parseError) {
            console.error(`Error parsing ${entry.name}:`, parseError);
            toast.error(`Failed to load profile ${entry.name}`);
          }
        }
  
        setProfiles(loadedProfiles);  
      } catch (error) {
        console.error('Error loading profiles:', error);
        toast.error('Failed to load profiles');
      }
    };
  
    loadProfiles();
  }, []); // Run Once

  useEffect(() => {

    const currentLength = profiles.length;
    const prevLength = prevProfilesLength.current;
    prevProfilesLength.current = currentLength;
  
    // Only proceed if a new profile was added
    if (currentLength <= prevLength) {
      return;
    }

    console.log('Profiles changed: ', profiles);
    if(profiles.length === 0){return;}
    const newProfile = profiles.at(-1);
    if (!newProfile) {
      toast.error('Failed to add profile. Please try again.');
      return;
    }
    const profilesToCheck = profiles.slice(0, -1);
    const hasDuplicate = profilesToCheck.some((profile) => profile.name === newProfile.name);
    if (hasDuplicate) {
      toast.error('Profile with the same name already exists.');
      setProfiles(profilesToCheck); //remove the last profile
      return;
    }else {
      toast.promise(
        uploadNewProfile(newProfile),
        {
          loading: 'Saving profile...',
          success: 'Profile loaded successfully.',
          error: 'Failed to save profile. Please try again.',
        }
      );
    }
  }, [profiles]);// Run when profiles change

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100">
        <Toaster />
        <Sidebar
          profiles={profiles}
          selectedProfiles={selectedProfiles}
          onProfileSelect={handleProfileSelect}
          onProfileDelete={handleProfileDelete}
        />
        <div className="flex-1 flex flex-col items-center pt-10 overflow-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <Routes>
              <Route
                path="/"
                element={<HomePage selectedProfiles={selectedProfiles} />}
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
