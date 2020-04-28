/**
 * build.ts
 * Copyright(c) 2020 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file build the client side javascript for in browser rendering
 */

const ENVIRONMENT = process.env.ROADS_ENV || 'default';
import { config as configBuilder } from 'roads-starter';
// todo: seems I can't import this?
let envify = require('envify/custom');
import * as fs from 'fs';
import * as Terser from 'terser';

let config = configBuilder(__dirname + '/../../config', ENVIRONMENT);

let builtPath = __dirname + '/../../static/js/client.brws.js';
let builtPathMin = __dirname + '/../../static/js/client.brws.min.js';
require('roads').build(__dirname + '/client.js', builtPath, {
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
        fs.readFile(builtPath, (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
})
.then((fileData: Buffer) => {
        let result = Terser.minify(fileData.toString(), {
            ecma: 2017,
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
        fs.writeFileSync(builtPathMin, result.code);
}).catch((err: Error) => {
    console.log('build error', err);
});