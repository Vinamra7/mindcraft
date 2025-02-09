import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import {mkdir, exists, BaseDirectory, writeTextFile, readTextFile} from '@tauri-apps/plugin-fs';
import toast, {Toaster} from 'react-hot-toast';

interface settings {
  host: string;
  port: string;
  auth: string;
  hostMindserver: boolean;
  mindserverHost: string;
  mindserverPort: string;
  loadMemory: boolean;
  initMessage: string;
  onlyChatWith: string;
  language: string;
  showBotViews: boolean;
  allowInsecureCoding: boolean;
  codeTimeoutMins: string;
  maxMessages: string;
  numExamples: string;
  maxCommands: string;
  verboseCommands: boolean;
  narrateBehavior: boolean;
  chatBotMessages: boolean;
}
const AdvancedSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<settings>({
    host: '127.0.0.1',
    port: '55916',
    auth: 'offline',
    hostMindserver: true,
    mindserverHost: 'localhost',
    mindserverPort: '8080',
    loadMemory: false,
    initMessage: 'Respond with hello world and your name',
    onlyChatWith: '',
    language: 'en',
    showBotViews: false,
    allowInsecureCoding: false,
    codeTimeoutMins: '-1',
    maxMessages: '15',
    numExamples: '2',
    maxCommands: '-1',
    verboseCommands: true,
    narrateBehavior: true,
    chatBotMessages: true,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = event.target;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    const name = target.name;

    setSettings({
      ...settings,
      [name]: value,
    });
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!(await exists('settings.json', { baseDir: BaseDirectory.AppData }))) {
          return;
        }
        const settingsString = await readTextFile('settings.json', { baseDir: BaseDirectory.AppData });
        const loadedSettings = JSON.parse(settingsString);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Ensure directory exists
    if (!(await exists('', { baseDir: BaseDirectory.AppData }))) {
      await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
    }
    const settingsString = JSON.stringify(settings, null, 2);
    await toast.promise(
      writeTextFile('settings.json', settingsString, { baseDir: BaseDirectory.AppData }),
      {
        loading: 'Saving settings...',
        success: 'Settings saved successfully.',
        error: 'Failed to save settings. Please try again.',
      }
    );

  };

  const Hint: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative cursor-pointer">
      <Info className="ml-1" size={16} />
      <span className="invisible group-hover:visible absolute top-full left-1/2 transform -translate-x-1/2 mt-1 p-2 bg-gray-700 text-white rounded-md text-xs whitespace-nowrap z-10">
        {text}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Advanced Settings</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="host" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Host
            <Hint text="Default: 127.0.0.1 (Or &quot;localhost&quot;, &quot;your.ip.address.here&quot;)" />
          </label>
          <input
            type="text"
            name="host"
            id="host"
            className="input-box w-full"
            value={settings.host}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="port" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Port
            <Hint text="Default: 55916" />
          </label>
          <input
            type="text"
            name="port"
            id="port"
            className="input-box w-full"
            value={settings.port}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="auth" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Auth
            <Hint text="Default: &quot;offline&quot; (Or &quot;microsoft&quot;)" />
          </label>
          <select
            name="auth"
            id="auth"
            className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
            value={settings.auth}
            onChange={handleInputChange}
          >
            <option value="offline">offline</option>
            <option value="microsoft">microsoft</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="hostMindserver" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Host Mindserver
            <Hint text="Default: true (Set to false to specify a public IP)" />
          </label>
          <input
            type="checkbox"
            name="hostMindserver"
            id="hostMindserver"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.hostMindserver}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="mindserverHost" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Mindserver Host
            <Hint text="Default: &quot;localhost&quot; (Or &quot;your.ip.address.here&quot;)" />
          </label>
          <input
            type="text"
            name="mindserverHost"
            id="mindserverHost"
            className="input-box w-full"
            value={settings.mindserverHost}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="mindserverPort" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Mindserver Port
            <Hint text="Default: 8080" />
          </label>
          <input
            type="text"
            name="mindserverPort"
            id="mindserverPort"
            className="input-box w-full"
            value={settings.mindserverPort}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="loadMemory" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Load Memory
            <Hint text="Default: false (Set to true to retain memory from previous sessions)" />
          </label>
          <input
            type="checkbox"
            name="loadMemory"
            id="loadMemory"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.loadMemory}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="initMessage" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Initial Message
            <Hint text="Default: &quot;Respond with hello world and your name&quot; (Sent to all agents on spawn)" />
          </label>
          <textarea
            name="initMessage"
            id="initMessage"
            className="input-box w-full"
            value={settings.initMessage}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="onlyChatWith" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Only Chat With
            <Hint text="Default: [] (List of users bots listen to; empty means public chat)" />
          </label>
          <input
            type="text"
            name="onlyChatWith"
            id="onlyChatWith"
            className="input-box w-full"
            value={settings.onlyChatWith}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="language" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Language
            <Hint text="Default: &quot;en&quot; (Supports languages from Google Cloud Translate)" />
          </label>
          <input
            type="text"
            name="language"
            id="language"
            className="input-box w-full"
            value={settings.language}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="showBotViews" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Show Bot Views
            <Hint text="Default: false (View bot&apos;s perspective in browser on ports 3000, 3001, etc.)" />
          </label>
          <input
            type="checkbox"
            name="showBotViews"
            id="showBotViews"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.showBotViews}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="allowInsecureCoding" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Allow Insecure Coding
            <Hint text="Default: false (Enables newAction command &amp; code execution. Use at your own risk)" />
          </label>
          <input
            type="checkbox"
            name="allowInsecureCoding"
            id="allowInsecureCoding"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.allowInsecureCoding}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="codeTimeoutMins" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Code Timeout Mins
            <Hint text="Default: -1 (-1 means no timeout, otherwise set in minutes)" />
          </label>
          <input
            type="text"
            name="codeTimeoutMins"
            id="codeTimeoutMins"
            className="input-box w-full"
            value={settings.codeTimeoutMins}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="maxMessages" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Max Messages
            <Hint text="Default: 15 (Number of messages retained in context)" />
          </label>
          <input
            type="text"
            name="maxMessages"
            id="maxMessages"
            className="input-box w-full"
            value={settings.maxMessages}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="numExamples" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Num Examples
            <Hint text="Default: 2 (Number of example responses given to the model)" />
          </label>
          <input
            type="text"
            name="numExamples"
            id="numExamples"
            className="input-box w-full"
            value={settings.numExamples}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="maxCommands" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Max Commands
            <Hint text="Default: -1 (Max consecutive commands allowed, -1 means no limit)" />
          </label>
          <input
            type="text"
            name="maxCommands"
            id="maxCommands"
            className="input-box w-full"
            value={settings.maxCommands}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="verboseCommands" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Verbose Commands
            <Hint text="Default: true (Displays full command syntax)" />
          </label>
          <input
            type="checkbox"
            name="verboseCommands"
            id="verboseCommands"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.verboseCommands}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="narrateBehavior" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Narrate Behavior
            <Hint text="Default: true (Chats simple automatic actions, e.g., &apos;Picking up item!&apos;)" />
          </label>
          <input
            type="checkbox"
            name="narrateBehavior"
            id="narrateBehavior"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.narrateBehavior}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="chatBotMessages" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Chat Bot Messages
            <Hint text="Default: true (Bots publicly chat with each other)" />
          </label>
          <input
            type="checkbox"
            name="chatBotMessages"
            id="chatBotMessages"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.chatBotMessages}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Settings
        </button>
      </form>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Back
      </button>
    </div>
  );
};

export default AdvancedSettingsPage;
