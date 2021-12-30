const http = require('http');
const config = require('./config');
const errorHandler = require('./error');
const requests = require('./requests');
const api = require('./api');

let server = http.createServer(function (request, response) {
	try {
		switch (request.method) {
			case 'POST':
				api.handleAPIRequest(request, response);
				break;
			case 'GET':
				requests.handleRequest(request, response);
				break;
			default:
				errorHandler.serveError(405, response);
				break;
		}
	} catch (err) {
		/* Last fail-safe */
		console.log(err);
		errorHandler.serveError(500, response);
	}
});

server.listen(config.json.port);
