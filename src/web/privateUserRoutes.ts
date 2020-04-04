import * as moment from 'moment';
import roadsReq from 'roads-req';
import * as qs from 'querystring';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import SimpleRouter, { SimpleRouterURL } from 'roads/types/middleware/simpleRouter';
import { Logger } from '../index';
import { CookieResponse } from 'roads/types/middleware/cookie';

function hasAllKeys(check: object, keys: Array<string>) {
    let checkKeys = Object.keys(check);

    for (let i = 0; i < keys.length; i++) {
        if (!checkKeys.includes(keys[i])) {
            return false;
        }
    }

    return true;
}

export interface PrivateUserRoutesConfig {
    cognitoJwks: {
        keys: Array<KIDJWK>
    },
    cognitoUrl: string,
    cognitoClientId: string,
    cognitoRedirectUri: string,
    cognitoClientSecret: string,
    secret: string,
    authCookieName: string,
    secure: boolean,
    hostname: string
}

export interface JWTUser {
    sub: string
}

// Can't tell why the library I use doesn't support the "kid" (https://tools.ietf.org/html/rfc7517#section-4.5) field in their jwks. This is a hack
export interface KIDJWK extends jwkToPem.EC {
    kid: string
}

export default (router: SimpleRouter, config: PrivateUserRoutesConfig, logger: Logger) => {
    if (!hasAllKeys(config, ['port', 'hostname', 'authCookieName', 'secure', 'secret', 'cognitoJwks', 'cognitoClientId', 'cognitoClientSecret'])) {
        throw new Error('Mising config key.');
    }

    function getProperJwk(decodedHeader: { kid: string }): jwkToPem.JWK | null {
        let kid = decodedHeader.kid;

        for (let i = 0; i < config.cognitoJwks.keys.length; i++) {
            if (config.cognitoJwks.keys[i].kid === kid) {
                return config.cognitoJwks.keys[i];
            }
        }
    
        return null;
    }

   router.addRoute('GET', '/login/redirect', async function (url: SimpleRouterURL, body: string, headers: {[x: string]: string}) {
        if (!url.query.code) {
            return new this.Response('No auth code found', 400, {'content-type': 'text/html'});
        }

        // exchange request tokens for oauth2 access token
        // https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html

        let authResponse = await roadsReq({
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

        let parsedResponse = JSON.parse(authResponse.body);

        if (typeof(parsedResponse) !== "object") {
            console.log("Could not locate ID Token in the auth response");
            return new this.Response("Unknown error", 500);
        }
        
        // save token, refresh, expiry info and remote user id into db via the create new user API call (append)
        // find a node jwt library
        // JWT decode the id token
        let jwtUser: JWTUser = await new Promise((resolve, reject) => {
            if (!("id_token" in parsedResponse)) {
                return reject(new Error("Could not locate ID Token in the auth response"));
            }

            let idToken = parsedResponse.id_token;

            // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
            // encryption secret is located at https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
            // so in this case, https://cognito-idp.us-east-1.amazonaws.com/us-east-1_B88VD5WrW/.well-known/jwks.json
            let decoded = jwt.decode(idToken, {complete: true});

            if (!decoded || typeof(decoded) === "string") {
                return reject(new Error('Could not decode the JWT body for this auth request'));
            }

            let jwk = getProperJwk(decoded.header);

            if (!jwk) {
                return reject(new Error('could not find the proper JWK for this auth request'));
            }

            let pem = jwkToPem(jwk);

            jwt.verify(idToken, pem, { algorithms: ['RS256'] }, function (err, decoded: JWTUser) {
                if (err) {
                    return reject(err);
                }

                resolve(decoded);
            });
        });

        // Create or update the local user record
        let apiUser = await this.api('PUT', '/users/' + jwtUser.sub, {
            "accessToken": parsedResponse.access_token,
            "expiresIn": parsedResponse.expires_in,
            "refreshToken": parsedResponse.refresh_token
        }, {});

        let response = new this.Response('Unexpected error when updating user login details', 500) as CookieResponse;

        if (apiUser.status === 200) {
            response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'}) as CookieResponse;
            
            let token = jwt.sign({
                val: apiUser.remoteId
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

    router.addRoute('POST', '/signout', async function (url, body, headers) {
        let response = new this.Response('', 302, {'content-type': 'text/html', 'location': '/'}) as CookieResponse;

        response.setCookie(config.authCookieName, null, {
            expires: moment().toDate(),
            secure: config.secure,
            domain: config.hostname
        });

        return response;
    });

    router.addRoute('GET', '/signout/redirect', async function (url, body, headers) {
        /*let redirectPage = Handlebars.compile(loginRedirectTemplate);
        let responseBody = redirectPage();*/

        return new this.Response('sign out redirect', 200, {'content-type': 'text/html'});
    });
}