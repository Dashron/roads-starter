"use strict";

// https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
var rand = function() {
    return Math.random().toString(36).substr(2);
};

// https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
var createToken = function() {
    return rand() + rand() + rand() + rand();
};

module.exports = (cookieName) => {
    return function (method, path, body, headers, next) {

        this.setNewCsrfToken = () => {
            this.csrfToken = createToken();
            let response = new this.Response();
            response.setCookie(cookieName, this.csrfToken);
            return response;
        };

        this.checkCsrfToken = (providedToken) => {
            return this.cookies[cookieName] === providedToken;
        };

        return next();
    };
};