"use strict";
/**
 * applyPrivateRoutes.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 * This file is an example of how to assign some private routes to a road server
 */

var fs = require('fs');

 /**
  * Before calling this function you should create your roads object and bind a SimpleRouter to that road.
  * You then pass the road to this function to assign a collection of example routes that should only
  * be rendered on the server. 
  * 
  * @param {SimpleRouter} router - The router that the routes will be added to
  */
module.exports = function (router) {
	router.addRoute('GET', 'client.brws.js', function (url, body, headers) {
		this.ignore_layout = true;
		// In the real world the body of the response should be created from a template engine.
		return new this.Response(fs.readFileSync(__dirname + '/static/build/client.brws.js').toString('utf-8'), 200, {
			'Content-Type': 'application/javascript; charset=UTF-8'
		});
	});

	router.addRoute('GET', 'amazon-cognito-auth.min.js', function (url, body, headers) {
		this.ignore_layout = true;
		// In the real world the body of the response should be created from a template engine.
		return new this.Response(fs.readFileSync(__dirname + '/static/js/amazon-cognito-auth.min.js').toString('utf-8'), 200, {
			'Content-Type': 'application/javascript; charset=UTF-8'
		});
	});

	router.addRoute('GET', 'loggedIn.js', function (url, body, headers) {
		this.ignore_layout = true;
		// In the real world the body of the response should be created from a template engine.
		return new this.Response(fs.readFileSync(__dirname + '/static/js/loggedIn.js').toString('utf-8'), 200, {
			'Content-Type': 'application/javascript; charset=UTF-8'
		});
	});

	router.addRoute('GET', 'client.map.json', function (url, body, headers) {
        this.ignore_layout = true;
		// In the real world the body of the response should be created from a template engine.
		return new this.Response(fs.readFileSync(__dirname + '/static/build/client.map.json').toString('utf-8'), 200, {
			'Content-Type': 'application/json; charset=UTF-8'
		});
	});

	router.addRoute('GET', 'index.css', function (url, body, headers) {
        this.ignore_layout = true;
		// In the real world the body of the response should be created from a template engine.
		return new this.Response(fs.readFileSync(__dirname + '/static/css/index.css').toString('utf-8'), 200, {
			'Content-Type': 'text/css; charset=UTF-8'
		});
	});
};