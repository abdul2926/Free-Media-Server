const crypto = require('crypto');
const config = require('./config');

module.exports.authenticate = authenticate;
module.exports.authenticated = authenticated;
module.exports.createAuthentication = createAuthentication;

function authenticate(password, response) {
    if (!password) {
        return;
    }

    let passwordHash = crypto.createHash(
        'sha256', config.auth.secret)
        .update(password, 'utf-8')
        .digest('base64');
    
    if (passwordHash == config.auth.password) {
        let cookie = crypto.createHash(
            'sha256', config.auth.secret)
            .update(passwordHash + crypto.randomBytes(256)
                .toString('base64')).digest('base64');
        config.auth.cookies.push(cookie);
        config.update(config);
        response.writeHead(302, {
            'Set-Cookie': `auth=${cookie}; path=/`,
            'Content-Type': 'text/html',
            'Location': '/'
        });
        response.end();
    } else {
        response.writeHead(401);
        response.end();
    }
}

function authenticated() {
    if (config.auth.password) {
        if (config.auth.enabled) {
            if (!config.auth.cookies.
            includes(parseCookies(request)).auth) {
                return false;
            }
        }
    }
    return true;
}

function parseCookies(request) {
    if (!request.headers.cookie) {
        return {};
    }
    let cookies = {}, reqCookies = request.headers.cookie;
	reqCookies && reqCookies.split(';').forEach(function (cookie) {
		let split = cookie.split('=');
		if (split.length > 2) {
			split = split.shift().join('=').unshift(split[0]);
		}
		cookies[split.shift().trim()] = decodeURI(split.join('='));
	});
	return cookies;
}

function createAuthentication(password) {
    let hash = crypto.createHash(
        'sha256', config.auth.secret)
        .update(password, 'utf-8').digest('base64');
    
    config.auth.password = hash;
    config.auth.cookies = [];
    config.update(config);
}
