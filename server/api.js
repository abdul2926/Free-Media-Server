const url = require('url');
const crypto = require('crypto');
const errors = require('./error');
var config = require('./config');
const files = require('./files');

module.exports.handleAPIRequest = handleAPIRequest;
module.exports.loggedIn = loggedIn;
module.exports.getPath = getPath;

function handleAPIRequest (request, response) {
	switch (request.method) {
		case 'GET':
			handleGET(request, response);
			break;
		case 'POST':
			handlePOST(request, response);
			break;
		default:
			response.writeHead(405, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(405));
			break;
	}
}

function handleGET(request, response) {
	let path = getPath(request)

	if (path.startsWith('/api/series/')) {
		path = '/api/series';
	}

	switch (path) {
		case '/api/getconfig':
			serveConfig(response);
			break;
		case '/api/getlib':
			serveLibrary(response);
			break;
		case '/api/series':
			serveSeries(request, response);
			break;
		default:
			response.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(404));
			break;
	}
}

function handlePOST(request, response) {
	let path = getPath(request)
	let buffer = '';
	request.on('data', chunk => {
		buffer += chunk;
	});
	request.on('end', () => {
		[port, libraries, lock, password] = parseFormData(buffer);
		switch (path) {
			case '/api/update':
				if (config.json.lock.hash) {
					if (!loggedIn(request)) {
						response.writeHead(302, {
							'Content-Type' : 'text/html',
							'location' : '/login'
						});
						response.end();
						return;
					}
				} 

				updatePort(port);
				updateLibraries(libraries);
				updateLock(lock);
				updatePassword(password);

				response.writeHead(302, {
					'Content-Type' : 'text/html',
					'Location' : '/'
				});
				response.end();
				break;
			case '/api/login':
				login(password, response);
				break;
			default:
				response.writeHead(404, {
					'Content-Type' : 'text/plain'
				});
				response.end(errors.get(404));
				break;
		}
	});
}

function getPath (request) {
	return url.parse(request.url, true).pathname
		.replace('/localhost', '')
		.replace('/127.0.0.1', '');
}

function parseFormData(buffer) {
	let sections = buffer.split('&');
	let port, libraries, lock, password;
	for (let i = 0; i < sections.length; i++) {
		sections[i] = sections[i].split('=');
		switch (sections[i][0]) {
			case 'port':
				port = sections[i][1];
				break;
			case 'libraries':
				libraries = sections[i][1];
				break;
			case 'lock':
				lock = sections[i][1];
				break;
			case 'password':
				password = sections[i][1];
				break;
		}
	}
	return [port, libraries, lock, password];
}

function login(password, response) {
	if (!password) {
		response.writeHead(400, {
			'Content-Type' : 'text/plain'
		});
		response.end(errors.get(400));
	}
	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	if (hash == config.json.lock.hash) {
		const cookie = crypto.createHash('sha256', config.json.secret).update(password + crypto.randomBytes(256).toString('hex')).digest('hex');
		config.json.auth.push(cookie);
		config.update(config.json);
		response.writeHead(302, {
			'Set-Cookie': `auth=${cookie}; path=/`,
			'Content-Type' : 'text/html',
			'Location' : 'back'
		});
		response.end();
	} else {
		response.writeHead(302, {
			'Location' : 'back',
			'Content-Type' : 'text/html'
		});
		response.end();
	}
}

function parseCookies(request) {
	let cookies = {}, reqCookies = request.headers.cookie;
	reqCookies && reqCookies.split(';').forEach(function (cookie) {
		let split = cookie.split('=');
		if (split.length > 2) {
			split = split.shift().join('=').unshift(split[0]);
		}
		cookies[split.shift().trim()] = decodeURI(split.join('='));
	});
	return cookies;
}

function loggedIn(request) {
	if (!config.json.lock.hash) {
		return true;
	}

	if (!config.json.auth.includes(parseCookies(request).auth)) {
		return false;
	}
	return true;
}

function updatePassword (password) {
	if (!password) {
		return;
	}
	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	config.json.lock.hash = hash;
	config.json.auth = [];
	config.update(config.json);
}

function updatePort(port) {
	if (!port) {
		return;
	}
	config.json.port = port;
	config.update(config.json);
}

function updateLibraries(libs) {
	if (!updateLibraries) {
		return;
	}
	const libraries = decodeURIComponent(libs).split(';');
	config.json.libs = libraries;
	config.update(config.json);
}

function updateLock (lock) {
	if (lock == null) {
		return;
	}

	if (lock == 'on')
		lock = true;
	else
		lock = false;

	config.json.lock.enabled = lock;
	config.update(config.json);
}

function serveConfig(response) {
	let publicConf = {
		"port" : config.json.port,
		"libraries" : config.json.libs,
		"lock" : config.json.lock.enabled
	}
	response.writeHead(200, {
		'Content-Type' : 'application/json'
	});
	response.write(JSON.stringify(publicConf));
	response.end();
}

async function serveLibrary(response) {
	if (!loggedIn()) {
		response.writeHead(401, {
			'Content-Type' : 'text/plain'
		});
		response.write(errors.get(401));
		response.end();
		return;
	}

	response.writeHead(200, {
		'Content-Type' : 'application/json'
	});
	const library = await files.getLibrary();
	response.write(JSON.stringify(library));
	response.end();
}

async function serveSeries(request, response) {
	if (!loggedIn()) {
		response.writeHead(401, {
			'Content-Type' : 'text/plain'
		});
		response.write(errors.get(401));
		response.end();
		return;
	}
	let path = getPath(request);
	let pathSplit = path.split('/');
	let id = pathSplit[pathSplit.length - 1];
	if (pathSplit.length > 4) {
		id = pathSplit[pathSplit.length - 2];
	}

	const library = await files.getLibrary();
	const series = library.series[id];
	if (!series) {
		response.writeHead(404, {
			'Content-Type' : 'text/plain'
		});
		response.end(errors.get(404));
		return;
	}

	response.writeHead(200, {
		'Content-Type' : 'application/json'
	});
	response.write(JSON.stringify(series));
	response.end();
}
