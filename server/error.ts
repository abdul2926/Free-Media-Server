import * as http from 'http';

export function serveError(code: number, response: http.ServerResponse) {
    switch (code) {
        case 404:
            serveHTML(code, 'not found', response);
            break;
    }
}

function serveHTML(code: number, elaboration: string, response: http.ServerResponse) {
    response.writeHead(code, {
        'Content-Type': 'text/html'
    });
    response.write(getErrorHTML(404, elaboration));
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
