"use strict";

// CSRF isn't an issue in client side JS, so we pass everything.
// NEVER USE THIS SERVER SIDE
module.exports = function (method, path, body, headers, next) {
    this.setNewCsrfToken = () => {
        return new this.Response();
    };

    this.checkCsrfToken = (providedToken) => {
        return true;
    };

    return next();
};