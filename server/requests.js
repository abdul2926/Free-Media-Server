const url = require('url');
const fs = require('fs');
const errorHandler = require('./error');

module.exports.handleRequest = handleRequest;

function handleRequest(request, response) {
	let path = url.parse(request.url, true).pathname;
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
			errorHandler.serveError(404, response);
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
	// TODO: Implement check for password protection
	fs.readFile(`./web/${directs.get(path)}`, function (error, data) {
		if (error) {
			errorHandler.serveError(404, response);
			return;
		}

		response.writeHead(200, {
			'Content-Type': 'text/html'
		});
		response.write(data);
		response.end();
	});
}
