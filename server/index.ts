import * as http from 'http';
import * as requestHandler from './requests';

var server = http.createServer(function (request, response) {
    requestHandler.handleRequest(request, response);
});

server.listen(8082);
