"use strict";

var jwt = require('jsonwebtoken');

module.exports = (authCookieName, secret) => {
    return function (method, path, body, headers, next) {
        this.loggedIn = false;
        
        if (this.cookies[authCookieName]) {
            try {
                let decoded = jwt.verify(this.cookies[authCookieName], secret, {
                    algorithms: ['HS256']
                });

                if (decoded) {
                    this.loggedIn = true;
                    this.authToken = this.cookies[authCookieName];
                    this.authDecoded = decoded;
                }
            } catch (e) {
                console.log('tokenResolver', e);
            }
        }

        return next();
    };
}