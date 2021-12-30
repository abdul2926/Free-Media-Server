import * as http from 'http';

import { handleRequest } from './requests';
import { settings } from './settings';
import { handleAPIRequest } from './api';
import { serveError } from './error';

var server = http.createServer(function (request, response) {
	try { 
		if (request.method == 'POST') {
			handleAPIRequest(request, response);
		} else  if (request.method == 'GET'){
			handleRequest(request, response);
		} else {
			serveError(405, response);
		}
	} catch (error) {
		response.writeHead(500, {
			'Content-Type': 'text/plain',
		});
		response.write(error);
		response.end();
	}
});

server.listen(settings.port);
