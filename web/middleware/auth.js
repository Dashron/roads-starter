"use strict";

var jwt = require('jsonwebtoken');
const CONFIG = require('../../config/config.json');

let secret = CONFIG.secret;
let authCookieName = CONFIG.authCookieName;

module.exports = function (method, path, body, headers, next) {
    this.loggedIn = false;
    
    if (this.cookies[authCookieName]) {
        try {
            let decoded = jwt.verify(this.cookies[authCookieName], secret, {
                algorithms: ['HS256']
            });

            if (decoded) {
                this.loggedIn = true;
            }
        } catch (e) {
            console.log('tokenResolver', e);
        }
    }

    return next();
}