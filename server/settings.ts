import * as crypto from 'crypto';
import * as fs from 'fs';

export var settings = loadSettings();

function loadSettings(): any { // Has to be of type any or typescript will cry
    try {
        var settings = fs.readFileSync('./settings.json', { encoding: 'utf-8' });
        return JSON.parse(settings);
    } catch (error) {
        var _settings = {
            "lock" : {
                "enabled": false,
                "hash": ""
            },
            "port": "8000",
            "libs" : [
                
            ]
        }
        var newSettings = JSON.parse(JSON.stringify(_settings));
        updateSettings(newSettings);
        return newSettings;
    }
}

export function updateSettings(settings: JSON) {
    fs.writeFile('./settings.json', JSON.stringify(settings, null, '\t'), error => {
        if (error) {
            console.log('Could not write settings data: ' + error);
        }
    });
}

function getHash(str: string) {
    const hasher = crypto.createHmac('sha256', 'fms');
    return hasher.update(str).digest("hex");
}
