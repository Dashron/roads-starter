"use strict";

let roadsStarter = require('../index.js');
const ENVIRONMENT = process.env.ROADS_ENV || 'default';
let config = require('../config.js')(__dirname + '/config', ENVIRONMENT);
const Handlebars = require('handlebars');
let fs = require('fs');

if (process.argv.length < 3 || process.argv[2] === "api") {
    console.log('starting api server');
    let api = new roadsStarter.APIProject(config.api);
    api.addRoadsUserEndpoints();
    api.start();
}

if (process.argv.length < 3 || process.argv[2] === "web") {
    console.log('starting web server');
    /*
    * LAYOUT
    */ 
    let layoutTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/templates/layout.hbs').toString('utf-8'));
    let pageNotFoundTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/templates/404.hbs').toString('utf-8'));

    let layout = (body, title) => {
        return layoutTemplate({
            title: title,
            body: body,
            config: config.web.layoutConstants
        });
    };

    /*
    * PROJECT
    */
    let privateWeb = new roadsStarter.PrivateWebProject(config.web, layout, () => {
        return layout(pageNotFoundTemplate(), 'Page not found');
    });

    /*
    * BASIC ROUTES
    */
    privateWeb.addRoadsUserFunctionality();
    
    if (ENVIRONMENT != "docker") {
        // docker sends these through nginx
        privateWeb.addStaticFolder('/static/js', __dirname + '/static/js', 'application/javascript');
        privateWeb.addStaticFolder('/static/css', __dirname + '/static/css', 'text/css');
    }

    privateWeb.addRoutes(__dirname + '/publicRoutes.js');
    privateWeb.addRoutes(__dirname + '/privateRoutes.js');

    /*
    * START PROJECT
    */
    privateWeb.start();
}