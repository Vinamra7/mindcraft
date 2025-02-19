import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, UserRound, AlertTriangle } from 'lucide-react';
import StartButton from './StartButton';
import TaskSection from './TaskSection';
import StartPopUp from './StartPopUp';
import { appDataDir, join  } from '@tauri-apps/api/path';
import {command as runnerCommand} from './command.ts';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

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

interface HomePageProps {
  selectedProfiles: Profile[];
  port: number;
  version: string;
}

const HomePage: React.FC<HomePageProps> = ({ selectedProfiles, port, version }) => {

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [taskPath, setTaskPath] = useState('');
  const [taskId, setTaskId] = useState('');
  const [appRunning, setAppRunning] = useState(false);
  const [pId, setPId] = useState<unknown>(null);

  const handleStartClick = async() =>{
    if(appRunning){ 
      setAppRunning(false);
      invoke('terminate_process', {pid: pId}).then(()=>{setPId(null)})
      return;
    }
      setIsPopupOpen(true);
  }

  const handlePopUpClose = () =>{
    setIsPopupOpen(false);
  }

  const handleStart = async() => {
    try {
      console.log("Starting with:", { taskPath, taskId });
      
      // Get profile paths
      //"cd /d G:\\mindcraft && node main.js --profiles \"C:\\Users\\Mishr\\AppData\\Roaming\\com.mindcraft.app\\gemini.json\""
      const appDataDirPath = await appDataDir();
      console.log("App data dir path:", appDataDirPath);
      const profilePaths = await Promise.all(
        selectedProfiles.map(profile => join(appDataDirPath, `${profile.name}.json`))
      );

      const commandString = `node main.js --profiles "${profilePaths.join('" "')}" ${taskPath ? `--taskPath "${taskPath}"` : ''} ${taskId ? `--taskId "${taskId}"` : ''}`;
      console.log("Profile paths:", profilePaths);
      console.log("Command string:", commandString);
      const runnerFileContent = runnerCommand() + `${commandString}\n pause`;
      const runnerFilePath = await join(appDataDirPath, 'runner.bat');
      await writeFile('runner.bat', new TextEncoder().encode(runnerFileContent), {baseDir: BaseDirectory.AppData})
        .then(async() => {
          setAppRunning(true);
          setIsPopupOpen(false);
          invoke('run_bat_file', {path: runnerFilePath}).then((pid)=>{setPId(pid)})
        })
        .catch((e) => {
          alert('Error running bot server')
          setAppRunning(false);
          console.log(e)
        });

  
    } catch (error) {
      setAppRunning(false);
      console.error("Fatal error:", error);
    }
  };
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
      <StartButton disabled={selectedProfiles.length === 0} isRunning={appRunning} onClick={handleStartClick}/>
      <TaskSection setTaskPath={setTaskPath} setTaskId={setTaskId} taskPath={taskPath} taskId={taskId}/>
      <StartPopUp 
      isOpen = {isPopupOpen}
      onClose = {handlePopUpClose}
      onStart = {handleStart}
      version={version}
      port={port}
      selectedProfiles={selectedProfiles.map((profile) => profile.name)}
      />
      <br />
      <div className="border border-yellow-600 bg-yellow-900 bg-opacity-50 p-4 rounded-lg w-full max-w-md mb-6 shadow-lg">
        <p className="text-yellow-300 text-sm font-medium flex items-center">
          <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            < AlertTriangle />
          </svg>
            <text style={{fontFamily: 'sans-serif !important;'}}>Important: Start Minecraft on port {port} before proceeding</text>
        </p>
      </div>
    </div>
  );
};

export default HomePage;
