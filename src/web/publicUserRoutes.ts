"use strict";

import SimpleRouter from "roads/types/middleware/simpleRouter";

import * as formValidation from './formValidation';
import { Logger } from "../index";

export interface PublicUserRoutesConfig {
    cognitoUrl: string,
    cognitoRedirectUri: string,
    cognitoClientId: string
}

export default (profilePage: Function, loginPage: Function) => {
    return function (router: SimpleRouter, config: PublicUserRoutesConfig, logger: Logger) {
        router.addRoute('GET', '/profile', async function (url, body, headers) {
            this.setTitle('Your Profile');
            if (!this.isLoggedIn()) {
                return new this.Response('', 302, {'location': '/'})
            }

            let userResponse = await this.api('GET', '/users/' + this.authDecoded.val);

            if (userResponse.status !== 200) {
                logger.warn(userResponse);
                return new this.Response('Unexpected error', 500);
            }
            let responseBody = JSON.parse(userResponse.body);

            let response = this.setNewCsrfToken();
            response.body = profilePage({
                csrfToken: this.csrfToken,
                user: responseBody
            });
                
            response.status = 200;
            response.headers['content-type'] = 'text/html';

            return response;
        });

        router.addRoute('POST', '/profile', async function (url, body, headers) {
            if (!this.isLoggedIn()) {
                return new this.Response('', 302, {'location': '/profile'})
            }

            if (!this.body) {
                // TODO: configurable response template
                return new this.Response('Invalid Request', 400);
            }

            if (!this.checkCsrfToken(this.body.csrfToken)) {
                // TODO: configurable response template
                return new this.Response('Invalid Request', 400);
            }
            
            let editResponse = await this.api('PATCH', '/users/' + this.authDecoded.val, {
                active: this.body.active === "true" ?  true : (this.body.active === "false" ? false : this.body.active)
            }, {
                "content-type": "application/json"
            });

            if (editResponse.status !== 200) {
                let parsedEditBody = JSON.parse(editResponse.body);
                let formData = formValidation.problemsToFormdata(['/active'], this.body, parsedEditBody['additional-problems']);
                let userResponse = await this.api('GET', '/users/' + this.authDecoded.val);

                if (userResponse.status !== 200) {
                    logger.warn(userResponse);
                    return new this.Response('Unexpected error', 500);
                }

                let response = this.setNewCsrfToken();
                response.body = profilePage({
                    csrfToken: this.csrfToken,
                    user: JSON.parse(userResponse.body),
                    formData: formData
                });
                
                response.status = 400;
                response.headers['content-type'] = 'text/html';

                return response;
            }

            return new this.Response('', 302, {'location': '/profile'});
        });

        router.addRoute('GET', '/login', async function (url, body, headers) {
            this.setTitle('Log In');
            
            let responseBody = loginPage({
                loggedIn: this.isLoggedIn(),
                cognitoUrl: config.cognitoUrl,
                redirectUrl: config.cognitoRedirectUri,
                clientId: config.cognitoClientId
            });
        
            return new this.Response(responseBody, 200, {'content-type': 'text/html'});
        });
    }
}