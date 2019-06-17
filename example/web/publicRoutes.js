"use strict";
const fs = require('fs');

let loginTemplate = fs.readFileSync(__dirname + '/templates/loginUrl.hbs').toString('utf-8');
let profileTemplate = fs.readFileSync(__dirname + '/templates/profile.hbs').toString('utf-8');
const Handlebars = require('handlebars');

module.exports = function (router, config) {
    router.addRoute('GET', '/login', function (url, body, headers) {
        let loginPage = Handlebars.compile(loginTemplate);
        
        let responseBody = loginPage({
            loggedIn: this.loggedIn,
            cognitoUrl: config.cognitoUrl,
            redirectUrl: config.cognitoRedirectUri,
            clientId: config.cognitoClientId
        });
    
        this.setTitle('Log In');
        return new this.Response(responseBody, 200, {'content-type': 'text/html'});
    });

    router.addRoute('GET', '/profile', async function (url, body, headers) {
        let profilePage = Handlebars.compile(profileTemplate);

        if (!this.loggedIn || !this.authDecoded || !this.authDecoded.val) {
            return new this.Response('', 302, {'location': '/'})
        }

        let userResponse = await this.api('GET', '/users/' + this.authDecoded.val);
        let apiHost = '';

        if (userResponse.status !== 200) {
            // todo: this should be a thrown 500 error
            throw new roads.HttpError('Unexpected Error', roads.HttpError.internal_server_error);
        }

        if (config.api.external.secure) {
            apiHost = 'https://' + config.api.external.hostname + (config.api.external.port != 443 ? ':' + config.api.external.port: '');
        } else {
            apiHost = 'http://' + config.api.external.hostname + (config.api.external.port != 80 ? ':' + config.api.external.port: '');
        }

        let responseBody = profilePage({
            apiHost: apiHost,
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
            refreshToken: body.refreshToken
        }, {
            "content-type": "application/json"
        });

        if (editResponse.status !== 200) {
            throw new roads.HttpError('Unexpected Error', roads.HttpError.internal_server_error);
        }

        return new this.Response('', 302, {'location': '/profile'});
    });
};