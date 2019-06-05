"use strict";
/**
 * client.js
 * Copyright(c) 2019 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 * This file is an example of using roads router in the client
 */

var roads = require('roads');
var road = new roads.Road();

// Currently I see two choices
// 1. You don't attach PJAX if logged in, forcing direct calls to the webserver and rendering it server side.
// 2. You assume logged in if the cookie is present and decodable as a JWT. This allows you to render logged in logic included on public views.
// NOTE: Both options send your clients the logged in and logged out logic in your public routes, and the logged in and logged out versions of the unfilled templates
//      Because of this, you should not put any secure information in the public routes or public templates.
// If you need to secure your data, you can create a second "logged in only" client.js file that is included only on logged in pages.


/*
// OPTION 1: UNTESTED
var jwt = require('jsonwebtoken');
var cookie = require('cookie');
let decoded = false;

try {
	let cookies = cookie.parse(document.cookie);
	decoded = jwt.decode(cookies[roads.env.ROADS_AUTH_COOKIE_NAME]);
} catch (e) {
	console.log(e);
}

if (!decoded) {
	// OPTION 2 MINUS PUBLICAUTH.JS
}*/

// OPTION 2
var pjax = new roads.PJAX(road, document.getElementById('main-content'), window);
pjax.addTitleMiddleware();
pjax.addCookieMiddleware(document);
pjax.register();
road.use(require('./publicAuth.js')(process.env.ROADS_AUTH_COOKIE_NAME, console));

let router = new roads.middleware.SimpleRouter(road);

require('./publicRoutes.js')(router, {
	secure: process.env.ROADS_SECURE,
	hostname: process.env.ROADS_HOSTNAME,
	port: process.env.ROADS_PORT,
	cognitoClientId: process.env.ROADS_COGNITO_CLIENT_ID,
	cognitoUrl: process.env.ROADS_COGNITO_URL,
	cognitoRedirectUri: process.env.ROADS_COGNITO_REDIRECT_URI
});