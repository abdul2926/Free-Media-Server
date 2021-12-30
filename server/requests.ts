import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';

import { serveError } from './error';

export function handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
	var path = url.parse(request.url, true).pathname;
	var contentType = 'text/html';
	
	var pathSplit = path.split('.');
	var filetype = pathSplit[pathSplit.length -1];

	if (filetype) {
		switch (filetype.toLowerCase()) {
			case 'css':
				contentType = 'text/css';
				break;
			case 'js':
				contentType = 'text/javascript'
				break;
		}
	}

	if (contentType != 'text/html') {
		fs.readFile(`./web${path}`, function (err, data) {
			if (err) {
				serveError(404, response);
			} else {
				response.writeHead(200, {
					'Content-Type': contentType
				});
				response.write(data);
				response.end();
			}
		});
		return;
	}

	var direct: string;
	switch (path) {
		case '/':
			direct = 'index.html';
			break;
		case '/settings':
			direct = 'settings.html';
			break;
		
		case '/authenticate':
			direct = 'auth.html';
			break;

		case '/updatehash':
			direct = 'updatehash.html';
			break;
		
		default:
			serveError(404, response);
			return;
	}

	fs.readFile(`./web/${direct}`, function (err, data) {
		if (err) {
			serveError(404, response);
			return;
		}

		response.writeHead(200, {
			'Content-Type': contentType
		});
		response.write(data);
		response.end();
	});
}
