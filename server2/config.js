const fs = require('fs');
const crypto = require('crypto');

module.exports = loadConfig();
module.exports.update = updateConfig;

function loadConfig() {
    try {
        let data = fs.readFileSync('./data/config.json', { 
            encoding: 'utf-8' 
        });
        return JSON.parse(data);
    } catch(error) {
        console.warn(`Creating new config because: ${error}`);
        let config = cleanConfig();
        updateConfig(config);
        return config;
    }
}

function cleanConfig() {
    return {
        'port' : '8000',
        'library' : ['./library'],
        'auth' : {
            'enabled' : false,
            'password' : '',
            'secret' : crypto.randomBytes(32).toString('base64'),
            'cookies' : []
        },
    }
}

function updateConfig(config) {
    fs.writeFile(
        './data/config.json',
        JSON.stringify(config, null, '  '),
        error => {
            if (error) {
                console.error(`Failed to save config: ${error}`);
            }
    });
}
