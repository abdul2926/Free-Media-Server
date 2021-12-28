import * as http from 'http';

import * as requestHandler from './requests';
import * as settingsHandler from './settings';

var server = http.createServer(function (request, response) {
    requestHandler.handleRequest(request, response);
});

server.listen(settingsHandler.settings.port);
