import * as http from 'http'
import * as url from 'url';
import * as crypto from 'crypto';

import { settings, updateSettings } from './settings';
import { serveError } from './error';

export function handleAPIRequest(request: http.IncomingMessage, response: http.ServerResponse) {
    var path = url.parse(request.url, true).pathname;
    if (!path.startsWith('/api')) {
        serveError(400, response);
        return;
    }

    var buffer = '';
    request.on('data', chunk => {
        buffer += chunk;
    });

    request.on('end', () => {
        var bufferArr = buffer.toString().split('=');
        var password = bufferArr[bufferArr.length -1];

        switch (path) {
            case '/api/updatehash':
                if (settings.lock.hash) {
                    updateHash(true, request, response, password);
                } else {
                    updateHash(false, request, response, password);
                }
                break;
            case '/api/authenticate':
                authenticate(password, request, response);
                break;
        }
    });
}

function parseCookies (request): any {
    var cookieList = {}, requestCookies = request.headers.cookie;
    requestCookies && requestCookies.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        cookieList[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return cookieList;
}

function authenticated(request: http.IncomingMessage, response: http.ServerResponse) {
    if (!settings.auth.includes(parseCookies(request).auth)) {
        serveError(403, response);
        return false;
    }
}

function updateHash(restricted: boolean, request: http.IncomingMessage, response: http.ServerResponse, password: string) {
    if (restricted) {
        if (!authenticated(request, response)) {
            return;
        }
    }

    if (!password) {
        serveError(400, response);
        return;
    }

    const hasher = crypto.createHmac('sha256', settings.secret);
    var hash = hasher.update(password).digest('hex');
    settings.lock.hash = hash;
    settings.lock.enabled = true;
    updateSettings(settings);

    response.writeHead(302, {
        'Location': '/authenticate',
        'Content-Type' : 'text/html'
    });
    response.end();
}

function authenticate(password: string, request: http.IncomingMessage, response: http.ServerResponse) {
    const hasher = crypto.createHmac('sha256', settings.secret);
    const hash = hasher.update(password).digest('hex');
    if (hash == settings.lock.hash) {
        const _hasher = crypto.createHmac('sha256', settings.secret);
        const cookieAuth = _hasher.update(crypto.randomBytes(64).toString('hex') + hash).digest('hex');
        settings.auth.push(cookieAuth);
        updateSettings(settings);
        response.writeHead(302, {
            'Set-Cookie': `auth=${cookieAuth}`,
            'Content-Type': 'text/html',
            'Location': '/'
        });
        response.end();
    } else {
        serveError(401, response);
    }

    response.writeHead(302, {
        'Location': '/',
        'Content-Type' : 'text/html'
    });
    response.end();
}
