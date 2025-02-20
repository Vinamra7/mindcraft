import { readFileSync } from 'fs';
import { join } from 'path';
import process from 'process';

let keys = {};
const APP_IDENTIFIER = 'com.mindcraft.app';

function getAppDataPath() {
    if (process.platform === 'win32') {
        return join(process.env.APPDATA, APP_IDENTIFIER);
    } else if (process.platform === 'darwin') {
        return join(process.env.HOME, 'Library', 'Application Support', APP_IDENTIFIER);
    } else {
        return join(process.env.HOME, '.config', APP_IDENTIFIER);
    }
}

function loadKeys() {
    // First try the Tauri UI's AppData location
    try {
        const appDataPath = join(getAppDataPath(), 'keys.json');
        const data = readFileSync(appDataPath, 'utf8');
        keys = JSON.parse(data);
        console.log('Keys loaded from AppData directory');
        return; // If successful, don't check the fallback location
    } catch (err) {
        console.warn('No keys.json found in AppData directory');
    }

    // Fallback to default
    try {
        const data = readFileSync('./keys.json', 'utf8');
        keys = JSON.parse(data);
        console.log('Keys loaded from deafult');
    } catch (err) {
        console.error('keys.json not found in default.');
    }
}

// Load keys when the module is imported
loadKeys();

export function getKey(name) {
    let key = keys[name];
    if (!key) {
        key = process.env[name];
    }
    if (!key) {
        throw new Error(`API key "${name}" not found in keys.json or environment variables!`);
    }
    return key;
}

export function hasKey(name) {
    return keys[name] || process.env[name];
}

// Optional: Add a function to reload keys if needed
export function reloadKeys() {
    keys = {};
    loadKeys();
}