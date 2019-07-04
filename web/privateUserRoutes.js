"use strict";

const moment = require('moment');
const roadsReq = require('roads-req');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

function hasAllKeys(check, keys) {
    let checkKeys = Object.keys(check);

    for (let i = 0; i < keys.length; i++) {
        if (!checkKeys.includes(keys[i])) {
            return false;
        }
    }

    return true;
}

module.exports = (router, config, logger) => {
    if (!hasAllKeys(config, ['port', 'hostname', 'authCookieName', 'secure', 'secret', 'cognitoJwks', 'cognitoClientId', 'cognitoClientSecret'])) {
        throw new Error('Mising config key.');
    }

    function getProperJwk(decodedHeader) {
        let kid = decodedHeader.kid;

        for (let i = 0; i < config.cognitoJwks.keys.length; i++) {
            if (config.cognitoJwks.keys[i].kid === kid) {
                return config.cognitoJwks.keys[i];
            }
        }
    
        return null;
    }

   router.addRoute('GET', '/login/redirect', async function (url, body, headers) {
        if (!url.query.code) {
            return new this.Response('No auth code found', 400, {'content-type': 'text/html'});
        }

        // exchange request tokens for oauth2 access token
        // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html

        let authResponse = await roadsReq.request({
            request: {
                method: 'POST',
                protocol: 'https',
                hostname: config.cognitoUrl,
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

            let jwk = getProperJwk(decoded.header);

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
                val: apiUser.body.remoteId
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
            logger.warn(apiUser);
        }

        return response;
    });

    router.addRoute('POST', '/signout', function (url, body, headers) {
        let response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'});

        response.setCookie(config.authCookieName, null, {
            expires: moment().toDate(),
            secure: config.secure,
            domain: config.hostname
        });

        return response;
    });

    router.addRoute('GET', '/signout/redirect', function (url, body, headers) {
        /*let redirectPage = Handlebars.compile(loginRedirectTemplate);
        let responseBody = redirectPage();*/

        return new this.Response('sign out redirect', 200, {'content-type': 'text/html'});
    });
}