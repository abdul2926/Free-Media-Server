import * as http from 'http';

import * as requestHandler from './requests';
import { settings } from './settings';

var server = http.createServer(function (request, response) {
    requestHandler.handleRequest(request, response);
});

server.listen(settings.port);
