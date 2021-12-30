import * as http from 'http';

export function serveError(code: number, response: http.ServerResponse) {
	switch (code) {
		case 404:
			serveHTML(code, 'Not found', response);
			break;
		case 413:
			serveHTML(code, 'Request entity too large', response);
			break;
		case 400:
			serveHTML(code, 'Bad Request', response);
			break;
		case 401:
			serveHTML(code, 'Unauthorized', response);
			break;
		case 403:
			serveHTML(code, 'Forbidden', response);
			break;
		case 405:
			serveHTML(code, 'Method not allowed', response);
			break;
		default:
			serveHTML(500, 'Internal server error', response);
			break;
	}
}

function serveHTML(code: number, elaboration: string, response: http.ServerResponse) {
	response.writeHead(code, {
		'Content-Type': 'text/html'
	});
	response.write(getErrorHTML(code, elaboration));
	response.end();
}

function getErrorHTML(code: number, elaboration: string): string {
	return `
	<html>
		<body>
			<h1> ${code}: ${elaboration} </h1>
		</body>
	</html>`;
}
