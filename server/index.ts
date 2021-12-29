import * as http from 'http';

import { handleRequest } from './requests';
import { settings } from './settings';
import { handleAPIRequest } from './api';
import { serveError } from './error';

var server = http.createServer(function (request, response) {
    if (request.method == 'POST') {
        handleAPIRequest(request, response);
    } else  if (request.method == 'GET'){
        handleRequest(request, response);
    } else {
        serveError(405, response);
    }
});

server.listen(settings.port);
