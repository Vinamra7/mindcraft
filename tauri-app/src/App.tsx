import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ApiKeyPage from './components/ApiKeyPage';
import ProfilePage from './components/ProfilePage';
import Sidebar from './components/Sidebar';
import AdvancedSettingsPage from './components/AdvancedSettingsPage';

interface Profile {
  name: string;
  modelType: string;
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const handleProfileSelect = (profile: Profile | null) => {
    setSelectedProfile(profile);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100">
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
