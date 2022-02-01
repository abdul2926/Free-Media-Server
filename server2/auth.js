const crypto = require('crypto');
const config = require('./config');
const errors = require('./error');

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
    // TODO
}

function parseCookies() {
    // TODO
}
