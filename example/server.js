"use strict";

let roadsStarter = require('../index.js');
const ENVIRONMENT = process.env.ROADS_ENV || 'default';
let config = require('../config.js')(__dirname + '/config', ENVIRONMENT);

const Handlebars = require('handlebars');
let fs = require('fs');
let apiLogger = require('./logger.js').createLogger('api-server');
let webLogger = require('./logger.js').createLogger('web-server');

if (process.argv.length < 3 || process.argv[2] === "api") {
    apiLogger.info('starting api server');
    let api = new roadsStarter.APIProject(config.api, apiLogger);
    let tokenResolver = require(__dirname + '/api/tokenResolver.js')(api.connection, apiLogger, config.api.secret);
    api.addTokenResolver(tokenResolver);
    api.addRoadsUserEndpoints();
    api.start();
}

if (process.argv.length < 3 || process.argv[2] === "web") {
    webLogger.info('starting web server');
    /*
    * LAYOUT
    */ 
    let layoutTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/web/templates/layout.hbs').toString('utf-8'));
    let pageNotFoundTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/web/templates/404.hbs').toString('utf-8'));

    let layout = (body, title, context) => {
        return layoutTemplate({
            title: title,
            body: body,
            config: config.web.layoutConstants,
            loggedIn: context ? context.loggedIn : false
        });
    };

    /*
    * PROJECT
    */
    let privateWeb = new roadsStarter.PrivateWebProject(config.web, webLogger, layout, pageNotFoundTemplate);
    
    if (ENVIRONMENT != "docker") {
        // docker sends these through nginx
        privateWeb.addStaticFolder('/static/js', __dirname + '/web/static/js', 'application/javascript');
        privateWeb.addStaticFolder('/static/css', __dirname + '/web/static/css', 'text/css');
    }

    let profileTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/web/templates/profile.hbs').toString('utf-8'));
    let loginUrlTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/web/templates/loginUrl.hbs').toString('utf-8'));

    privateWeb.addRoutes(require('../web/publicUserRoutes.js')(profileTemplate,loginUrlTemplate));
    privateWeb.addRoutes(require('../web/privateUserRoutes.js'));
    privateWeb.addRoutes(__dirname + '/web/publicRoutes.js');
    privateWeb.addRoutes(__dirname + '/web/privateRoutes.js');

    /*
    * START PROJECT
    */
    privateWeb.start();
}