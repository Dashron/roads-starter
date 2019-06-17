"use strict";
/**
 * build.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file build the client side javascript for in browser rendering
 */

const ENVIRONMENT = process.env.ROADS_ENV || 'default';
let config = require('../config.js')(__dirname + '/config', ENVIRONMENT);

require('roads').build(__dirname + '/client.js', __dirname + '/static/js/client.brws.js', {
    use_sourcemaps: true,
    envify: {
        ROADS_SECURE: config.web.secure,
	    ROADS_HOSTNAME: config.web.hostname,
	    ROADS_PORT: config.web.port,
        ROADS_COGNITO_CLIENT_ID: config.web.cognitoClientId,
        ROADS_COGNITO_URL: config.web.cognitoUrl,
        ROADS_COGNITO_REDIRECT_URI: config.web.cognitoRedirectUri,
        ROADS_AUTH_COOKIE_NAME: config.web.authCookieName,
        ROADS_EXTERNAL_API_SECURE: config.web.api.external.secure,
		ROADS_EXTERNAL_API_HOSTNAME: config.web.api.external.hostname,
		ROADS_EXTERNAL_API_PORT: config.web.api.external.port,
    }
});