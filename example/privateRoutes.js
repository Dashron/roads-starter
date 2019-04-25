"use strict";

let indexTemplate = require('fs').readFileSync(__dirname + '/templates/index.hbs').toString('utf-8');
const Handlebars = require('handlebars');

module.exports = function (router, config) {
    router.addRoute('GET', '/', function (url, body, headers) {
        let pageData = {};
        pageData.loggedIn = this.loggedIn;
        let indexPage = Handlebars.compile(indexTemplate);
        this.setTitle('Welcome Home');
        return new this.Response(indexPage(pageData), 200, {'content-type': 'text/html'});
    });
};