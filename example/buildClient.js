"use strict";
/**
 * build.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file build the client side javascript for in browser rendering
 */

const config = require('./config/config.json');

require('roads').build(__dirname + '/client.js', __dirname + '/static/js/client.brws.js', {
    use_sourcemaps: true,
    envify: {
        ROADS_SECURE: config.web.secure,
	    ROADS_HOSTNAME: config.web.hostname,
	    ROADS_PORT: config.web.port,
        ROADS_COGNITO_CLIENT_ID: config.web.cognitoClientId,
        ROADS_COGNITO_URL: config.web.cognitoUrl
    }
});