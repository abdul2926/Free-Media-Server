const url = require('url');
const fs = require('fs');
const errors = require('./error');
const api = require('./api');
const img = require('./img');
const video = require('./video')
let config = require('./config');

module.exports.handle = handle;
module.exports.serveError = serveError;

function handle(request, response) {
    let path = url.parse(request.url, false).pathname;
    let fileType = path.split('.').pop();
    switch (fileType) {
        case 'css':
            serveCSS(path, response);
            return;
        case 'js':
            serveJS(path, response);
            return;
    }
}

function serveCSS(path, response) {
    fs.readFile(`./web2/css${path}`, (error, data) => {

    });
}

function serveError(code, response) {
    // Todo: actually serve a error page
    response.writeHead(code, {
        'Content-Type' : 'text/plain'
    });
    response.end(errors(code));
}
