"use strict";

module.exports = (profilePage, loginPage) => {
    return function (router, config) {
        router.addRoute('GET', '/profile', async function (url, body, headers) {
            this.setTitle('Your Profile');
            if (!this.loggedIn || !this.authDecoded || !this.authDecoded.val) {
                return new this.Response('', 302, {'location': '/'})
            }

            let userResponse = await this.api('GET', '/users/' + this.authDecoded.val);

            if (userResponse.status !== 200) {
                // todo: this should be a thrown 500 error
                throw new roads.HttpError('Unexpected Error', roads.HttpError.internal_server_error);
            }

            let responseBody = profilePage({
                user: userResponse.body
            });

            return new this.Response(responseBody, 200, {'content-type': 'text/html'});
        });

        router.addRoute('POST', '/profile', async function (url, body, headers) {
            if (!this.loggedIn || !this.authDecoded || !this.authDecoded.val) {
                return new this.Response('', 302, {'location': '/profile'})
            }

            if (!this.body || !this.body.refreshToken) {
                // todo: this should be a thrown 400 error
                return new this.Response('', 400);
            }

            let editResponse = await this.api('PATCH', '/users/' + this.authDecoded.val, {
                refreshToken: this.body.refreshToken
            }, {
                "content-type": "application/json"
            });

            if (editResponse.status !== 200) {
                throw new roads.HttpError('Unexpected Error', roads.HttpError.internal_server_error);
            }

            return new this.Response('', 302, {'location': '/profile'});
        });

        router.addRoute('GET', '/login', function (url, body, headers) {
            this.setTitle('Log In');
            
            let responseBody = loginPage({
                loggedIn: this.loggedIn,
                cognitoUrl: config.cognitoUrl,
                redirectUrl: config.cognitoRedirectUri,
                clientId: config.cognitoClientId
            });
        
            
            return new this.Response(responseBody, 200, {'content-type': 'text/html'});
        });
    }
}