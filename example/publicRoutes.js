"use strict";
const fs = require('fs');

let loginTemplate = fs.readFileSync(__dirname + '/templates/loginUrl.hbs').toString('utf-8');
const Handlebars = require('handlebars');

module.exports = function (router, config) {
    router.addRoute('GET', '/login', function (url, body, headers) {
        let loginPage = Handlebars.compile(loginTemplate);
        let responseBody = loginPage({
            //redirectUrl: (config.web.secure ? 'https':'http') + '://localhost:8080/login/redirect',
            // todo: use the proper hostname so cookies work
            cognitoUrl: config.cognitoUrl,
            redirectUrl: (config.secure ? 'https':'http') + '://' + config.hostname + (config.port ? ':' + config.port : '') + '/login/redirect',
            clientId: config.cognitoClientId
        });
    
        this.setTitle('Log In');
        return new this.Response(responseBody, 200, {'content-type': 'text/html'});
    });
};