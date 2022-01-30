const url = require('url');
const fs = require('fs');
const errors = require('./error');
const api = require('./api');
const config = require('./config');

module.exports.handleIMGRequest = handleIMGRequest;

function handleIMGRequest (request, response) {
	switch (request.method) {
		case 'GET':
			handleGET(request, response);
			break;
		default:
			response.writeHead(405, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(405));
			break;
	}
}

function handleGET(request, response) {
	if (config.json.lock.enabled) {
		if (!api.loggedIn(request)) {
			response.writeHead(401, {
				'Content-Type' : 'text/plain'
			});
			response.end(errors.get(401));
		}
	}

	let path = url.parse(request.url, true).pathname.replace('/localhost', '').replace('/127.0.0.1', '');
	serveImage(response, decodeURIComponent(path));
}

function serveImage (response, file) {
	let fileSplit = file.split('.');
	let fileType = fileSplit[fileSplit.length - 1];
	if (fileType == 'jpg') fileType = 'jpeg';

	var rs = fs.createReadStream(file);
	rs.on('open', function() {
		response.writeHead(200, {
			'Content-Type' : `image/${fileType}`
		});
		rs.pipe(response);
	});

	rs.on('error', function() {
		response.writeHead(404, {
			'Content-Type' : 'text/plain'
		});
		response.end(errors.get(404));
	});
}
