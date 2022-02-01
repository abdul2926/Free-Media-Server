const http = require('http');
const config = require('./server2/config');
const requests = require('./server/requests');

let server = http.createServer((request, response) => {
    requests.handleRequest(request, response);
});

process.on('uncaughtException', error => {
    console.error(error);
});

server.listen(config.port);
