import fs from 'fs';
import path from 'path';
import os from 'os';
import process from 'process';

// Default settings
const defaultSettings = {
    "minecraft_version": "1.20.4",
    "host": "127.0.0.1",
    "port": process.env.MINECRAFT_PORT || 55916,
    "auth": "offline",
    "host_mindserver": true,
    "mindserver_host": "localhost",
    "mindserver_port": process.env.MINDSERVER_PORT || 8080,
    "base_profile": "./profiles/defaults/survival.json",
    "profiles": ["./andy.json"],
    "load_memory": false,
    "init_message": ((process.env.PROFILES) && JSON.parse(process.env.PROFILES)) || "Respond with hello world and your name",
    "only_chat_with": [],
    "language": "en",
    "show_bot_views": false,
    "allow_insecure_coding": false,
    "code_timeout_mins": -1,
    "relevant_docs_count": 5,
    "max_messages": 15,
    "num_examples": 2,
    "max_commands": -1,
    "verbose_commands": true,
    "narrate_behavior": true,
    "chat_bot_messages": true,
};

let settingsData = null;
const APP_IDENTIFIER = 'com.mindcraft.app';
function getAppDataPath() {
    switch (process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA, APP_IDENTIFIER);
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', APP_IDENTIFIER);
        default:
            return path.join(os.homedir(), '.config', APP_IDENTIFIER);
    }
}

function loadSettings() {
    try {
        const appDataPath = getAppDataPath();
        const settingsPath = path.join(appDataPath, 'settings.json');
        
        if (fs.existsSync(settingsPath)) {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            try {
                settingsData = JSON.parse(settingsContent);
                console.log('Loaded settings from:', settingsPath);
            } catch (parseError) {
                console.error('Error parsing settings.json, using defaults:', parseError);
                settingsData = defaultSettings;
            }
        } else {
            console.log('Settings file not found, using defaults');
            settingsData = defaultSettings;
        }
    } catch (error) {
        console.error('Error accessing settings, using defaults:', error);
        settingsData = defaultSettings;
    }
}

// Load settings when module is imported
loadSettings();

// Watch for changes in settings file
try {
    const appDataPath = getAppDataPath();
    const settingsPath = path.join(appDataPath, 'settings.json');
    fs.watch(settingsPath, (eventType) => {
        if (eventType === 'change') {
            loadSettings();
        }
    });
} catch (error) {
    console.error('Error setting up file watcher:', error);
}

export default new Proxy({}, {
    get: (target, prop) => settingsData[prop]
});