const http = require('http');
const config = require('./config');
const requests = require('./requests');

let server = http.createServer(function (request, response) {
	requests.handleRequest(request, response);
});

process.on('uncaughtException', error => {
	console.error(`Uncaught exception: ${error.toString()}\nCallstack: ${error.stack}`);
});

server.listen(config.json.port);
