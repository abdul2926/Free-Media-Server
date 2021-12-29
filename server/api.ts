import * as http from 'http'
import * as url from 'url';
import Cookies from 'cookies-ts';
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
        const data = JSON.parse(buffer.toString()) as any;

        switch (path) {
            case '/api/updatehash':
                if (settings.lock.hash) {
                    updateHash(true, response, data.password);
                } else {
                    updateHash(false, response, data.password);
                }
                break;
            case '/api/authenticate':
                authenticate(data.password, response);
                break;
        }
    });
}

function authenticated(response: http.ServerResponse) {
    const cookies = new Cookies();
    if (!cookies.isKey('auth')) {
        serveError(401, response);
        return false;
    }
    if (settings.auth.contains(cookies.get('auth'))) {
        serveError(403, response);
        return false;
    }
}

function updateHash(restricted: boolean, response: http.ServerResponse, password: string) {
    if (restricted) {
        if (!authenticated(response)) {
            return;
        }
    }

    if (!password) {
        serveError(400, response);
        return;
    }

    const hasher = crypto.createHmac('sha256', settings.secret);
    const hash = hasher.update(password);
    settings.lock.hash = hash.toString();
    settings.lock.enabled = true;
    updateSettings(settings);
}

function authenticate(password: string, response: http.ServerResponse) {
    const hasher = crypto.createHmac('sha256', settings.secret);
    const hash = hasher.update(password);
    if (hash == settings.lock.hash) {
        const cookieAuth = hasher.update(crypto.randomBytes(64).toString('hex') + hash);
        settings.auth.push(cookieAuth.toString());
        updateSettings(settings);
        const cookies = new Cookies();
        var date = new Date();
        date.setTime(date.getTime() + 1000*60*24*3); // 3 days
        cookies.set('auth', cookieAuth.toString(), {
            expires: date
        });
    } else {
        serveError(401, response);
    }
}
