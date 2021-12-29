import * as fs from 'fs';
import * as crypto from 'crypto';

export var settings = loadSettings();

function loadSettings(): any { 
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
                
            ],
            "auth": [

            ],
            "secret": crypto.randomBytes(32).toString('hex')
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
