"use strict";

var jwt = require('jsonwebtoken');

module.exports = (authCookieName, logger) => {
    return function (method, path, body, headers, next) {
        this.loggedIn = false;
    
        if (this.cookies[authCookieName]) {
            try {
                let decoded = jwt.decode(this.cookies[authCookieName]);
                
                if (decoded) {
                    this.loggedIn = true;
                    this.authToken = this.cookies[authCookieName];
                    this.authDecoded = decoded;
                }
            } catch (e) {
                logger.error(e);
            }
        }

        return next();
    };
}