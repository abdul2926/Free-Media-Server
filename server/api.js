const url = require('url');
const crypto = require('crypto');
const errors = require('./error');
var config = require('./config');

// TODO: Fix redirects system and error handling (it's an inconsistent mess right now)

module.exports.handleAPIRequest = handleAPIRequest;
module.exports.loggedIn = loggedIn;

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
	let path = url.parse(request.url, true).pathname.replace('/localhost', '').replace('/127.0.0.1', '');
	path = path.replace('/localhost', '');
	switch (path) {
		case '/api/getconfig':
			serveConfig(response);
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
	let path = url.parse(request.url, true).pathname.replace('/localhost', '').replace('/127.0.0.1', '');
	let buffer = '';
	request.on('data', chunk => {
		buffer += chunk;
	});
	request.on('end', () => {
		[port, libraries, lock, password] = parseFormData(buffer);
		switch (path) {
			case '/api/update':
				if (config.json.lock.hash)
				updatePassword(true, request, response, password);
				else
				updatePassword(false, request, response, password);
				break;
			case '/api/login':
				login(password, response);
				break;
			default:
				errors.get(404, response);
				break;
		}
	});
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
		errors.get(400, response);
	}
	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	if (hash == config.json.lock.hash) {
		const cookie = crypto.createHash('sha256', config.json.secret).update(password + crypto.randomBytes(256).toString('hex')).digest('hex');
		config.json.auth.push(cookie);
		config.update(config.json);
		response.writeHead(302, {
			'Set-Cookie': `auth=${cookie}`,
			'Content-Type' : 'text/html',
			'Location' : '/'
		});
		response.end();
	} else {
		errors.get(401, response);
		response.writeHead(302, {
			'Location' : '/',
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
	if (!config.json.auth.includes(parseCookies(request).auth)) {
		return false;
	}
	return true;
}

function updatePassword (restricted, request, response, password) {
	if (restricted) {
		if (!loggedIn(request)) {
			response.writeHead(302, {
				'Location' : '/login',
			});
			response.end();
			return;
		}
	}
			
	if (!password) {
		errors.get(400, response);
		return;
	}

	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	config.json.lock.hash = hash;
	config.update(config.json);
	response.writeHead(302, {
		'Location' : '/login',
		'Content-Type' : 'text/html'
	});
	response.end();
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
