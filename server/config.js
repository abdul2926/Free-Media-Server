const fs = require('fs');
const crypto = require('crypto');

module.exports.json = loadConfig();
module.exports.update = updateConfig;

function loadConfig() {
	/* TODO: Check if everything needed in the JSON file is present and valid */
	try {
		let _config = fs.readFileSync('./config.json', {
			encoding: 'utf-8'
		});
		return JSON.parse(_config);
	} catch (err) {
		let __config = {
			"lock" : {
				"enabled" : false,
				"hash" : ""
			},
			"port" : "8000",
			"libs" : [
				"./library"
			],
			"auth" : [],
			"secret" : crypto.randomBytes(16).toString('hex')
		}
		__config = JSON.parse(JSON.stringify(__config));
		updateConfig(__config);
		return __config;
	}
}

function updateConfig(_config) {
	fs.writeFile('./config.json', JSON.stringify(_config, null, '\t'), error => {
		if (error) {
			// TODO: Better error handling
			console.log(`Failed to write settings data: ${error}`)
		}
	});
}
