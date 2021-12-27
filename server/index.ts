import * as http from 'http';
const NodeCache = require('node-cache');
var cache = new NodeCache();

import * as requestHandler from './requests';
import * as settingsHandler from './settings';

var server = http.createServer(function (request, response) {
    settingsHandler.cacheSettings(cache);
    requestHandler.handleRequest(request, response);
});

server.listen(8082);
