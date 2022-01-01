const url = require('url');
const fs = require('fs');
const errors = require('./error');
const api = require('./api');
var config = require('./config');

module.exports.handleRequest = handleRequest;

function handleRequest(request, response) {
	let path = url.parse(request.url, true).pathname.replace('/localhost', '').replace('/127.0.0.1', '');

	if (path.startsWith('/api')) {
		api.handleAPIRequest(request, response);
		return;
	}

	let filetype = path.split('.').slice(-1);
	if (filetype && filetype == 'css' || filetype == 'js') {
		serveNonHTML(filetype, path, response);
		return;
	}

	serveHTML(path, response);
}

function serveNonHTML(type, path, response) {
	fs.readFile(`./web${path}`, function (error, data) {
		if (error) {
			response.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(404));
		} else {
			response.writeHead(200, {
				'Content-Type' : type == 'css' ? 'text/css' : 'text/javascript',
			});
			response.write(data);
			response.end();
		}
	});
}

let directs = new Map([
	['/', 'index.html'],
	['/index', 'index.html'],
	['/settings', 'settings.html'],
	['/config', 'settings.html'],
	['/login', 'login.html']
]);

function serveHTML(path, response) {
	if (config.json.lock.hash) {
		if (directs.get(path) == 'settings.html') {
			if (!api.loggedIn(request)) {
				response.writeHead(302, {
					'Content-Type' : 'text/html',
					'Location' : '/login'
				});
				response.end();
				return;
			}
		}
	}

	if (config.json.lock.enabled) {
		if (!api.loggedIn(request)) {
			if (!directs.get(path) == 'login.html') {
				response.writeHead(302, {
					'Content-Type' : 'text/html',
					'Location' : '/login'
				});
				response.end();
				return;
			}
		}
	}

	fs.readFile(`./web/${directs.get(path)}`, function (error, data) {
		if (error) {
			response.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(404));
			return;
		}

		response.writeHead(200, {
			'Content-Type': 'text/html'
		});
		response.write(data);
		response.end();
	});
}
