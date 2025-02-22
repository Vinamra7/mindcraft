import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { mkdir, exists, BaseDirectory, writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import toast, { Toaster } from 'react-hot-toast';

interface AdvancedSettingsPageProps {
  onPortChange: (port: number) => void;
  onVersionChange: (version: string) => void;
}

export interface settings {
  minecraft_version: string;
  host: string;
  port: number;
  auth: string;
  host_mindserver: boolean;
  mindserver_host: string;
  mindserver_port: number;
  base_profile: string;
  profiles: string[];
  load_memory: boolean;
  init_message: string;
  only_chat_with: string[];
  language: string;
  show_bot_views: boolean;
  allow_insecure_coding: boolean;
  code_timeout_mins: number;
  relevant_docs_count: number;
  max_messages: number;
  num_examples: number;
  max_commands: number;
  verbose_commands: boolean;
  narrate_behavior: boolean;
  chat_bot_messages: boolean;
}

const AdvancedSettingsPage: React.FC<AdvancedSettingsPageProps> = ({onPortChange, onVersionChange}) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<settings>({
    minecraft_version: '1.20.4',
    host: '127.0.0.1',
    port: 55916,
    auth: 'offline',
    host_mindserver: true,
    mindserver_host: 'localhost',
    mindserver_port: 8080,
    base_profile: './profiles/defaults/survival.json',
    profiles: ['./andy.json'],
    load_memory: false,
    init_message: 'Respond with hello world and your name',
    only_chat_with: [],
    language: 'en',
    show_bot_views: false,
    allow_insecure_coding: false,
    code_timeout_mins: -1,
    relevant_docs_count: 5,
    max_messages: 15,
    num_examples: 2,
    max_commands: -1,
    verbose_commands: true,
    narrate_behavior: true,
    chat_bot_messages: true,
  });
  // Global storage for saved settings
  const originalSettingsRef = useRef<settings>(settings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!(await exists('settings.json', { baseDir: BaseDirectory.AppData }))) {
          return;
        }
        const settingsString = await readTextFile('settings.json', { baseDir: BaseDirectory.AppData });
        const loadedSettings = JSON.parse(settingsString); // declared locally
        setSettings(loadedSettings);
        originalSettingsRef.current = loadedSettings;
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    onPortChange(settings.port);
  },[settings.port, onPortChange]);

  useEffect(() => {
    onVersionChange(settings.minecraft_version);
  },[settings.minecraft_version, onVersionChange]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
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
    ).then(() => {originalSettingsRef.current = settings;});
  };

  const handleCancel = () => {
    setSettings(originalSettingsRef.current);
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
        <div className='mb-4'>
          <label htmlFor='minecraft_version' className='block text-sm font-medium text-gray-300 flex items-center tracking-wide'>
            Minecraft Java Version
            <Hint text='Default: 1.20.4' />
          </label>
          <input
            type='text'
            name='minecraft_version'
            id='minecraft_version'
            className='input-box w-full'
            value={settings.minecraft_version}
            onChange={(event) => {
              setSettings({...settings, minecraft_version: event.target.value})
            }}
          />
        </div>

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
            onChange={(event) => {
              setSettings({...settings, host: event.target.value})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="port" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Port
            <Hint text="Default: 55916" />
          </label>
          <input
            type="number"
            name="port"
            id="port"
            className="input-box w-full"
            value={settings.port}
            onChange={(event) => {
              setSettings({...settings, port: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
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
            onChange={(event) => {
              setSettings({...settings, auth: event.target.value})
            }}
          >
            <option value="offline">offline</option>
            <option value="microsoft">microsoft</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="host_mindserver" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Host Mindserver
            <Hint text="Default: true (Set to false to specify a public IP)" />
          </label>
          <input
            type="checkbox"
            name="host_mindserver"
            id="host_mindserver"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.host_mindserver}
            onChange={(event) => {
              setSettings({...settings, host_mindserver: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mindserver_host" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Mindserver Host
            <Hint text="Default: &quot;localhost&quot; (Or &quot;your.ip.address.here&quot;)" />
          </label>
          <input
            type="text"
            name="mindserver_host"
            id="mindserver_host"
            className="input-box w-full"
            value={settings.mindserver_host}
            onChange={(event) => {
              setSettings({...settings, mindserver_host: event.target.value})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mindserver_port" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Mindserver Port
            <Hint text="Default: 8080" />
          </label>
          <input
            type="number"
            name="mindserver_port"
            id="mindserver_port"
            className="input-box w-full"
            value={settings.mindserver_port}
            onChange={(event) => {
              setSettings({...settings, mindserver_port: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="base_profile" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Base Profile
            <Hint text="Default: ./profiles/defaults/survival.json" />
          </label>
          <input
            type="text"
            name="base_profile"
            id="base_profile"
            className="input-box w-full"
            value={settings.base_profile}
            onChange={(event) => {
              setSettings({...settings, base_profile: event.target.value})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="load_memory" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Load Memory
            <Hint text="Default: false (Set to true to retain memory from previous sessions)" />
          </label>
          <input
            type="checkbox"
            name="load_memory"
            id="load_memory"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.load_memory}
            onChange={(event) => {
              setSettings({...settings, load_memory: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="init_message" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Initial Message
            <Hint text="Default: &quot;Respond with hello world and your name&quot; (Sent to all agents on spawn)" />
          </label>
          <textarea
            name="init_message"
            id="init_message"
            className="input-box w-full"
            value={settings.init_message}
            onChange={(event) => {
              setSettings({...settings, init_message: event.target.value})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="only_chat_with" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Only Chat With
            <Hint text="Default: [] (List of users bots listen to; empty means public chat)" />
          </label>
          <input
            type="text"
            name="only_chat_with"
            id="only_chat_with"
            className="input-box w-full"
            value={settings.only_chat_with.join(', ')}
            onChange={(event) => {
              setSettings({...settings, only_chat_with: event.target.value.split(',').map(item => item.trim()).filter(item => item !== '')})
            }}
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
            onChange={(event) => {
              setSettings({...settings, language: event.target.value})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="show_bot_views" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Show Bot Views
            <Hint text="Default: false (View bot's perspective in browser on ports 3000, 3001, etc.)" />
          </label>
          <input
            type="checkbox"
            name="show_bot_views"
            id="show_bot_views"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.show_bot_views}
            onChange={(event) => {
              setSettings({...settings, show_bot_views: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="allow_insecure_coding" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Allow Insecure Coding
            <Hint text="Default: false (Enables newAction command & code execution. Use at your own risk)" />
          </label>
          <input
            type="checkbox"
            name="allow_insecure_coding"
            id="allow_insecure_coding"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.allow_insecure_coding}
            onChange={(event) => {
              setSettings({...settings, allow_insecure_coding: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="code_timeout_mins" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Code Timeout Mins
            <Hint text="Default: -1 (-1 means no timeout, otherwise set in minutes)" />
          </label>
          <input
            type="number"
            name="code_timeout_mins"
            id="code_timeout_mins"
            className="input-box w-full"
            value={settings.code_timeout_mins}
            onChange={(event) => {
              setSettings({...settings, code_timeout_mins: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="relevant_docs_count" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Relevant Docs Count
            <Hint text="Default: 5" />
          </label>
          <input
            type="number"
            name="relevant_docs_count"
            id="relevant_docs_count"
            className="input-box w-full"
            value={settings.relevant_docs_count}
            onChange={(event) => {
              setSettings({...settings, relevant_docs_count: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="max_messages" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Max Messages
            <Hint text="Default: 15 (Number of messages retained in context)" />
          </label>
          <input
            type="number"
            name="max_messages"
            id="max_messages"
            className="input-box w-full"
            value={settings.max_messages}
            onChange={(event) => {
              setSettings({...settings, max_messages: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="num_examples" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Num Examples
            <Hint text="Default: 2 (Number of example responses given to the model)" />
          </label>
          <input
            type="number"
            name="num_examples"
            id="num_examples"
            className="input-box w-full"
            value={settings.num_examples}
            onChange={(event) => {
              setSettings({...settings, num_examples: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="max_commands" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Max Commands
            <Hint text="Default: -1 (Max consecutive commands allowed, -1 means no limit)" />
          </label>
          <input
            type="number"
            name="max_commands"
            id="max_commands"
            className="input-box w-full"
            value={settings.max_commands}
            onChange={(event) => {
              setSettings({...settings, max_commands: Number(event.target.value)})
            }}
           onWheel={e => e.target instanceof HTMLElement && e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="verbose_commands" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Verbose Commands
            <Hint text="Default: true (Displays full command syntax)" />
          </label>
          <input
            type="checkbox"
            name="verbose_commands"
            id="verbose_commands"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.verbose_commands}
            onChange={(event) => {
              setSettings({...settings, verbose_commands: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="narrate_behavior" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Narrate Behavior
            <Hint text="Default: true (Chats simple automatic actions)" />
          </label>
          <input
            type="checkbox"
            name="narrate_behavior"
            id="narrate_behavior"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.narrate_behavior}
            onChange={(event) => {
              setSettings({...settings, narrate_behavior: event.target.checked})
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="chat_bot_messages" className="block text-sm font-medium text-gray-300 flex items-center tracking-wide">
            Chat Bot Messages
            <Hint text="Default: true (Bots publicly chat with each other)" />
          </label>
          <input
            type="checkbox"
            name="chat_bot_messages"
            id="chat_bot_messages"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-600 rounded-md"
            checked={settings.chat_bot_messages}
            onChange={(event) => {
              setSettings({...settings, chat_bot_messages: event.target.checked})
            }}
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
          onClick={() => { handleCancel(); navigate(-1); }}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Back
        </button>
    </div>
  );
};

export default AdvancedSettingsPage;