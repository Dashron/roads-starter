"use strict";

const Logger = require('../logger.js');
const log = Logger.createLogger('web');
var Server = require('roads-server').Server;

const fs = require('fs');
const moment = require('moment');
const roadsReq = require('roads-req');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const crypto = require('crypto');
const path = require('path');

let {
    Road,
    middleware,
    Response
} = require('roads');

module.exports = class PrivateWebProject {
    constructor (config, layoutWrapper, pageNotFoundHtml) {
        if (!this.hasAllKeys(config, ['port', 'hostname', 'authCookieName', 'secure', 'secret', 'cognitoJwks', 'cognitoClientId', 'cognitoClientSecret'])) {
            throw new Error('Mising config key.');
        }

        this.road = new Road();
        this.config = config;

        this.road.use(Logger.middleware('web-server'));
        this.road.use(middleware.killSlash);
        this.road.use(middleware.cookie());
        this.road.use(require('./addLayout.js')(layoutWrapper, pageNotFoundHtml));
        this.road.use(middleware.setTitle);
        this.road.use(middleware.parseBody);
        this.road.use(require('./middleware/api.js')(config.api.secure, config.api.hostname, config.api.port));
        this.road.use(require('./middleware/privateAuth.js')(config.authCookieName, config.secret));

        this.router = new middleware.SimpleRouter(this.road);
    }

    // todo: shared root project object
    hasAllKeys(check, keys) {
        let checkKeys = Object.keys(check);
    
        for (let i = 0; i < keys.length; i++) {
            if (!checkKeys.includes(keys[i])) {
                return false;
            }
        }
    
        return true;
    }

    getRoad() {
        return this.road;
    }

    getRouter() {
        return this.router;
    }

    getProperJwk(decodedHeader) {
        let kid = decodedHeader.kid;

        for (let i = 0; i < this.config.cognitoJwks.keys.length; i++) {
            if (this.config.cognitoJwks.keys[i].kid === kid) {
                return this.config.cognitoJwks.keys[i];
            }
        }
    
        return null;
    }

    addRoutes(filePath) {
        require(filePath)(this.router, this.config);
    }

    addStaticFile(urlPath, filePath, contentType, encoding='utf-8') {
        this.router.addRoute('GET', urlPath, function (url, body, headers) {
            this.ignore_layout = true;
            return new this.Response(fs.readFileSync(filePath).toString(encoding), 200, {
                'Content-Type': contentType + '; charset=' + encoding
            });
        });
    }

    addStaticFolder(rootPath, folderPath, contentType, encoding='utf-8') {
        let urlSeparator = '/';

        if (rootPath === '/') {
            throw new Error('I\'m pretty sure you don\'t want to mount your root directory');
        }

        if (rootPath[rootPath.length -1] === '/') {
            urlSeparator = '';
        }

        let files = fs.readdirSync(folderPath);

        for (let i = 0; i < files.length; i++) {

            console.log('adding static file ' + files[i] + ' to ' + rootPath + urlSeparator + files[i]);
            this.addStaticFile(rootPath + urlSeparator + files[i], path.format({
                dir: folderPath,
                base: files[i]
            }), contentType, encoding);
        }
    }

    start() {
        let options = undefined;

        if (this.config.credentials) {
			options = {
                key: fs.readFileSync(this.config.credentials.privateKey).toString(), 
                cert: fs.readFileSync(this.config.credentials.certificate).toString()
            };
        }

        let server = new Server(this.road, function (err) {
            log.error(err);
            
            switch (err.code) {
                case 404:
                    return new Response(err.htmlMessage ? err.htmlMessage : 'Page not found', 404);
                case 405:
                    return new Response('Not Allowed', 405);
                default:
                case 500:
                    return new Response('Unknown Error', 500);
            }
        }, options);

        server.listen(this.config.port, () => {
            log.log('listening at ' + this.config.hostname + ':' + this.config.port);
        });
    }

    addRoadsUserFunctionality() {
        let config = this.config;
        let project = this;

        this.router.addRoute('GET', '/login/redirect', async function (url, body, headers) {
            if (!url.query.code) {
                return new this.Response('No auth code found', 400, {'content-type': 'text/html'});
            }
    
            // exchange request tokens for oauth2 access token
            // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    
            let authResponse = await roadsReq.request({
                request: {
                    method: 'POST',
                    protocol: 'https:',
                    hostname: 'dashron.auth.us-east-1.amazoncognito.com',
                    path: '/oauth2/token',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                },
                requestBody: qs.stringify({
                    grant_type: 'authorization_code',
                    client_id: config.cognitoClientId,
                    redirect_uri: config.cognitoRedirectUri,
                    code: url.query.code,
    
                }),
                basicAuth: {
                    un: config.cognitoClientId,
                    pw: config.cognitoClientSecret
                }
            });
            
            // save token, refresh, expiry info and remote user id into db via the create new user API call (append)
            // find a node jwt library
            // JWT decode the id token
            let jwtUser = await new Promise((resolve, reject) => {
                // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
                // encryption secret is located at https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
                // so in this case, https://cognito-idp.us-east-1.amazonaws.com/us-east-1_B88VD5WrW/.well-known/jwks.json
                let decoded = jwt.decode(authResponse.body.id_token, {complete: true});

                if (!decoded) {
                    reject(new Error('Could not decode the JWT body for this auth request'));
                }

                let jwk = project.getProperJwk(decoded.header);
    
                if (!jwk) {
                    reject(new Error('could not find the proper JWK for this auth request'));
                }
    
                let pem = jwkToPem(jwk);
    
                jwt.verify(authResponse.body.id_token, pem, { algorithms: ['RS256'] }, function (err, decoded) {
                    if (err) {
                        return reject(err);
                    }
    
                    resolve(decoded);
                });
            });

            // Create or update the local user record
            let apiUser = await this.api('PUT', '/users/' + jwtUser.sub, {
                "accessToken": authResponse.body.access_token,
                "expiresIn": authResponse.body.expires_in,
                "refreshToken": authResponse.body.refresh_token
            }, {});

            let response = new this.Response('Unexpected error when updating user login details', 500);

            if (apiUser.status === 200) {
                response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'});

                let token = jwt.sign({
                    val: apiUser.body.id
                }, config.secret, {
                    expiresIn: '1d',
                    algorithm: 'HS256'
                });
        
                response.setCookie(config.authCookieName, token, {
                    expires: moment().add(1, 'd').toDate(),
                    secure: config.secure,
                    domain: config.hostname,
                    path: '/'
                });
            } else {
                // todo: this needs better error handling
                console.log(apiUser);
            }

            return response;
        });
    
        this.router.addRoute('GET', '/signout', function (url, body, headers) {
            let response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'});
    
            response.setCookie(this.config.authCookieName, null, {
                expires: moment().toDate(),
                secure: this.config.secure,
                domain: this.config.hostname
            });
    
            return response;
        });
    
        this.router.addRoute('GET', '/signout/redirect', function (url, body, headers) {
            /*let redirectPage = Handlebars.compile(loginRedirectTemplate);
            let responseBody = redirectPage();*/
    
            return new this.Response('sign out redirect', 200, {'content-type': 'text/html'});
        });
    }
}

