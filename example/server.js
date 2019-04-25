"use strict";

let roadsStarter = require('../index.js');
let config = require('./config/config.json');
const Handlebars = require('handlebars');
let fs = require('fs');

// TODO: Maybe all projects should have an init call that sets up router and roads and stuff, like public web. this allows for consistency, and likely better testing too
let api = new roadsStarter.APIProject(config.api);
api.addRoadsUserEndpoints();
api.start();

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
privateWeb.addStaticFolder('/static/js', __dirname + '/static/js', 'application/javascript');
privateWeb.addStaticFolder('/static/css', __dirname + '/static/css', 'text/css');
privateWeb.addRoutes(__dirname + '/publicRoutes.js');
privateWeb.addRoutes(__dirname + '/privateRoutes.js');

/*
 * START PROJECT
 */
privateWeb.start();