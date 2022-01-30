const url = require('url');
const fs = require('fs');
const errors = require('./error');
const api = require('./api');
const img = require('./img');
var config = require('./config');
const video = require('./video');

module.exports.handleRequest = handleRequest;

const webVersion = 'web2';

function handleRequest(request, response) {
	let path = url.parse(request.url, true).pathname.replace('/localhost', '').replace('/127.0.0.1', '');

	if (path.startsWith('/api')) {
		api.handleAPIRequest(request, response);
		return;
	}

	//if (path.startsWith('/img')) {
	//	img.handleIMGRequest(request, response);
	//	return;
	//}

	let filetype = path.split('.').slice(-1);
	if (filetype && filetype == 'css' || filetype == 'js') {
		serveNonHTML(filetype, path, response);
		return;
	}

	if (filetype == 'jpg' || filetype == 'jpeg' || filetype == 'png' || filetype == 'gif') {
		img.handleIMGRequest(request, response);
		return;
	}

	if (path.startsWith('/series')) {
		if (path.split('/').length > 3) {
			path = '/episode';
		} else {
			path = '/series';
		}
	}

	if (path.startsWith('/video')) {
		video.stream(request, response);
		return;
	}

	serveHTML(path, request, response);
}

function serveNonHTML(type, path, response) {
	fs.readFile(`./${webVersion}${path}`, function (error, data) {
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
	['/login', 'login.html'],
	['/series', 'series.html'],
	['/episode', 'episode.html']
]);

function serveHTML(path, request, response) {
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
		if (config.json.lock.hash) {
			if (!api.loggedIn(request)) {
				if (directs.get(path) != 'login.html') {
					path = '/login';
				}
			}
		}
	}

	fs.readFile(`./${webVersion}/${directs.get(path)}`, function (error, data) {
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
