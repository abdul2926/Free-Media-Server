const http = require('http');
const config = require('./config');
const errorHandler = require('./error');
const requests = require('./requests');

let server = http.createServer(function (request, response) {
	requests.handleRequest(request, response);
});

server.listen(config.json.port);
