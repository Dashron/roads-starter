"use strict";
/**
 * applyPrivateRoutes.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 */
const fs = require('fs');
const Handlebars = require('handlebars');
const moment = require('moment');
const roadsReq = require('roads-req');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

let {
    secret,
    cookieName,
    domain,
    secure,
    cognitoClientId,
    cognitoClientSecret,
    cognitoJwks
} = require('../tokens.js');

let loginTemplate = require('fs').readFileSync(__dirname + '/static/templates/login.hbs').toString('utf-8');

function getProperJwk(decodedHeader) {
    let kid = decodedHeader.kid;
    for (let i = 0; i < cognitoJwks.keys.length; i++) {
        if (cognitoJwks.keys[i].kid === kid) {
            return cognitoJwks.keys[i];
        }
    }

    return null;
}

 /**
  * 
  * @param {SimpleRouter} router - The router that the routes will be added to
  */
module.exports = async function (router) {
    router.addRoute('GET', '/login', function (url, body, headers) {
        let loginPage = Handlebars.compile(loginTemplate);
        let responseBody = loginPage({
            domain: domain,
            protocol: secure ? 'https':'http'
        });

        return new this.Response(responseBody, 200, {'content-type': 'text/html'});
    });

    router.addRoute('GET', '/login/redirect', async function (url, body, headers) {
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
                client_id: cognitoClientId,
                redirect_uri: (secure ? 'https://' : 'http://') + domain + '/login/redirect',
                code: url.query.code,

            }),
            basicAuth: {
                un: cognitoClientId,
                pw: cognitoClientSecret
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

        // todo: once this is all tested we should probably redirect back home.
        let response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'});

        let token = jwt.sign({
            val: 1 //apiUser.id
        }, secret, {
            expiresIn: '1d',
            algorithm: 'HS256'
        });

        response.setCookie(cookieName, token, {
            expires: moment().add(1, 'd').toDate(),
            secure: secure,
            domain: domain,
            path: '/'
        });

        return response;
    });

    router.addRoute('GET', '/signout', function (url, body, headers) {
        let response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'});

        response.setCookie(cookieName, null, {
            expires: moment().add(1, 'd').toDate(),
            secure: secure,
            domain: domain
        });

        return response;
    });

    router.addRoute('GET', '/signout/redirect', function (url, body, headers) {
        /*let redirectPage = Handlebars.compile(loginRedirectTemplate);
        let responseBody = redirectPage();*/

        return new this.Response('sign out redirect', 200, {'content-type': 'text/html'});
    });
};
