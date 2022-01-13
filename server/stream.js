const api = require('./api');
const files = require('./files');
const fs = require('fs');

module.exports = streamVideo;

async function streamVideo(request, response) {
	if (!api.loggedIn()) {
		response.writeHead(401, {
			'Content-Type' : 'text/plain'
		});
		response.write(errors.get(401));
		response.end();
		return;
	}

	const library = await files.getLibrary();
	let url = api.getPath(request);
	url = url.split('/');

	const path = library.series[url[url.length - 2]].files[url[url.length - 1]];
	let filetype = path.split('.');
	filetype = filetype[filetype.length - 1];

	fs.stat(path, function (err, stats) {
		if (err) {
			console.log(err);
			return;
		}

		let range = request.headers.range;
		let positions = range.replace(/bytes=/, "").split("-");
		let start = parseInt(positions[0], 10);
		let total = stats.size;
		let end = positions[1] ? parseInt(positions[1], 10) : total - 1;
		let chunksize = (end - start) + 1;
	
		fstream = fs.createReadStream(path);
		fstream.on('open', function () {
		response.writeHead(206, {
			'Content-Type': `video/${filetype}`,
			'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
			'Accept-Ranges' : 'bytes',
			'Content-Length': chunksize,
		});

		fstream.pipe(response);
		});

		fstream.on('error', function (err) {
			response.end(err);
		});
	});
}