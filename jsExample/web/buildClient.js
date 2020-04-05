"use strict";
/**
 * build.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file build the client side javascript for in browser rendering
 */

const ENVIRONMENT = process.env.ROADS_ENV || 'default';
let config = require('roads-starter').config(__dirname + '/../config', ENVIRONMENT);
let envify = require('envify/custom');
let fs = require('fs');
var Terser = require("terser");

require('roads').build(__dirname + '/client.js', __dirname + '/static/js/client.brws.js', {
    browserifyOptions: {
        debug: true,
        transform: [envify({
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
        }), "brfs"]
    }
}).then(() => {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + '/static/js/client.brws.js', (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
})
.then((fileData) => {
        let result = Terser.minify(fileData.toString(), {
            ecma: "2017",
            warnings: "verbose",
            mangle: false,
            // REMOVE THIS IN PRODUCTION BUILDS FOR a SMALLER FILE SIZE
            sourceMap: {
                // this seems to fail, not sure why yet
                //content: "inline",
                url: "inline",
                //root: "/static/js/client.brws.js"
            } //*/
        });
        if (result.error) {
            throw result.error;
        }
        fs.writeFileSync(__dirname + '/static/js/client.brws.min.js', result.code);
}).catch((err) => {
    console.log('build error', err);
});