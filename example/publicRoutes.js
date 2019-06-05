"use strict";
const fs = require('fs');

let loginTemplate = fs.readFileSync(__dirname + '/templates/loginUrl.hbs').toString('utf-8');
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
};