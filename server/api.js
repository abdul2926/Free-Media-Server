const url = require('url');
const crypto = require('crypto');
const errorHandler = require('./error');
var config = require('./config');

module.exports.handleAPIRequest = handleAPIRequest;

function handleAPIRequest (request, response) {
	let path = url.parse(request.url, true).pathname;
	if (!path.startsWith('/api')) {
		errorHandler.serveError(400, response);
		return;
	}
	let buffer = '';
	request.on('data', chunk => {
		buffer += chunk;
	});
	request.on('end', () => {
		/* TODO: Check integrity of all form submissions */
		/* Fix parsing */
		let formData = buffer.toString().split('&');
		if (formData.length > 4) {
			let _formData = formData;
			for (let i = 0; i < 4; i++)
				_formData.shift();
			formData[3] = _formData.join('&');
		}
		let password = formData.toString().split('=');
		password = password[password.indexOf('password') + 1];
		console.log(password);
		/* End of parsing section */

		if (!password || password == -1) {
			errorHandler.serveError(400, response);
			return;
		}
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
		}
	});
}

function login(password, response) {
	console.log(`Password before hash(login): ${password}`);
	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	console.log(`hash: ${hash}`);
	console.log(`saved hash: ${config.json.lock.hash}`);
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
		errorHandler.serveError(401, response);
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

function loggedIn(response, request) {
	if (config.json.auth.includes(parseCookies(request).auth)) {
		response.writeHead(302, {
			'Location' : '/login',
			'Content-Type' : 'text/html'
		});
		response.end();
	}
}

function updatePassword (restricted, request, response, password) {
	if (restricted)
		if (!loggedIn(response, request))
			return;
	if (!password) {
		errorHandler.serveError(400, response);
		return;
	}
	console.log(`Password before hash(update): ${password}`);
	const hash = crypto.createHash('sha256', config.json.secret).update(password, 'utf-8').digest('hex');
	config.json.lock.hash = hash;
	config.update(config.json);
	response.writeHead(302, {
		'Location' : '/login',
		'Content-Type' : 'text/html'
	});
	response.end();
}
