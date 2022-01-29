const fs = require('fs');
const api = require('./api');
const files = require('./files');

exports.stream = stream;

async function stream(request, response) {
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

    let stat = fs.statSync(path);
    let total = stat.size;

    let contentType = '';
    if (filetype == '.mp4')
        contentType = 'video/mp4';
    else
        contentType = 'video/webm';
    
    if (request.headers.range) {
        let range = request.headers.range;
        let parts = range.replace(/bytes=/, '').split('-');
        let partstart = parts[0];
        let partend = parts[1];

        let start = parseInt(partstart, 10);
        let end = partend ? parseInt(partend, 10) : total - 1;
        let chunksize = (end - start) + 1;

        let file = fs.createReadStream(path, {
            start: start,
            end: end
        });

        response.writeHead(206, {
            'Content-Range' : `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType
        });
        response.openedFile = file;
        file.pipe(response);
    } else {
        file = fs.createReadStream(path);
        response.writeHead(200, {
            'Content-Length': total,
            'Content-Type': contentType
        });
        response.openedFile = file;
        file.pipe(response);
    }

    response.on('close', function() {
        if (response.openedFile) {
            response.openedFile.unpipe(this);
            if (this.openedFile.fd) {
                fs.close(this.openedFile.fd);
            }
        }
    });
}
