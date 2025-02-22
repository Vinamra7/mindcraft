import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, UserRound, AlertTriangle } from 'lucide-react';
import StartButton from './StartButton';
import TaskSection from './TaskSection';
import StartPopUp from './StartPopUp';
import { appDataDir, join  } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import Terminal from './Terminal';

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
  appRunning: boolean;
  setAppRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface TerminalMessasge{
  type: string;
  content: string;
}

const HomePage: React.FC<HomePageProps> = ({ selectedProfiles, port, version, appRunning, setAppRunning }) => {

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const openTerminalWindow = async () => {
    setIsTerminalOpen(true);
    console.log("Opening terminal window")
  }
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessasge[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [taskPath, setTaskPath] = useState('');
  const [taskId, setTaskId] = useState('');
  const [pId, setPId] = useState<unknown>(null);

  const handleStartClick = async() =>{
    if(appRunning){ 
      setAppRunning(false);
      await invoke('terminate_process', {pid: pId}).then(()=>{
        setPId(null); setAppRunning(false); setIsPopupOpen(false);
      })
      .catch(error => {
        console.log("Error terminating process:", error);
        throw new Error(`Termination Failed:  ${error}`);
      })
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
      const appDataDirPath = await appDataDir();
      console.log("App data dir path:", appDataDirPath);
      const profilePaths = await Promise.all(
        selectedProfiles.map(profile => join(appDataDirPath, `${profile.name}.json`))
      );

      const commandString = `node main.js --profiles "${profilePaths.join('" "')}" ${taskPath ? `--taskPath "${taskPath}"` : ''} ${taskId ? `--taskId "${taskId}"` : ''}`;
      console.log("Profile paths:", profilePaths);
      console.log("Command string:", commandString);
      setAppRunning(true);
      setIsPopupOpen(false);
      setIsTerminalOpen(true);
      await invoke('setup_environment')
      .catch(error => {
        console.log("Error setting up environment:", error);
        throw new Error(`Setup Failed:  ${error}`);
      })
      const args: string[] = []
      args.push("--profiles")
      profilePaths.forEach((profilePath) => {args.push(profilePath)})
      if(taskPath) args.push("--taskPath", taskPath)
      if(taskId) args.push("--taskId", taskId)
      console.log("running with args: ", args)
      const currentPid = await invoke('run_node_app', {commandArgs: args});
      setPId(currentPid);
  
    } catch (error) {
      setAppRunning(false);
      console.error("Fatal error:", error);
      alert(`Something went wrong`);
    }
  };
  if(!isTerminalOpen){
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-6">MINDCRAFT</h1>
        <div className="flex space-x-4 mb-6">
          <Link 
            to="/api-key" 
            onClick={(e) => appRunning && e.preventDefault()}
            className={`flex items-center px-4 py-2 rounded-md ${
              appRunning ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <KeyRound className="mr-2" />
            API
          </Link>
          <Link 
            to="/profile" 
            onClick={(e) => appRunning && e.preventDefault()}
            className={`flex items-center px-4 py-2 rounded-md ${
              appRunning ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
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
        
        <div className={`w-full ${appRunning ? 'opacity-50 pointer-events-none' : ''}`}>
          <TaskSection 
            setTaskPath={setTaskPath} 
            setTaskId={setTaskId} 
            taskPath={taskPath} 
            taskId={taskId}
          />
        </div>
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
        {(!isPopupOpen && appRunning) && (
          <button onClick={openTerminalWindow}
          className='bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md'
          >Open Terminal</button>
        )}
      </div>
    );
  }
  else return <Terminal 
  setIsTerminalOpen={setIsTerminalOpen}
  messages={terminalMessages}
  setMessages={setTerminalMessages}
  />;
};

export default HomePage;
