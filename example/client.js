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

var pjax = new roads.PJAX(road, document.getElementById('main-content'), window);
pjax.addTitleMiddleware();
pjax.addCookieMiddleware(document);
pjax.register();
let router = new roads.middleware.SimpleRouter(road);
require('./publicRoutes.js')(router, {
	secure: process.env.ROADS_SECURE,
	hostname: process.env.ROADS_HOSTNAME,
	port: process.env.ROADS_PORT,
	cognitoClientId: process.env.ROADS_COGNITO_CLIENT_ID,
	cognitoUrl: process.env.ROADS_COGNITO_URL
});

/*road.request('GET', '/')
	.then(function (response) {
		console.log(response);
	});

road.request('GET', '/test')
	.then(function (response) {
		console.log(response);
	})
	.catch(function (err) {
		console.log('[' + err.code + ']' + err.message);
		console.log(err.stack);
	});*/