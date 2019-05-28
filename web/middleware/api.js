"use strict";

let {
    Client
} = require('roads');

module.exports = (secure, hostname, port) => {
    return function (method, path, body, headers, next) {
        // Add an "api" function to the request context that makes HTTP requests to the API
        let apiClient = new Client(secure, hostname, port);
        this.api = (method, path, body, headers) => {
            if (this.loggedIn) {
                if (!headers) {
                    headers = {};
                }

                headers.authorization = "Bearer " + this.authToken;
            }
            
            return apiClient.request(method, path, body, headers)
            .then((response) => {
                // todo: this should check the response content type and only parse app/json type
                if (response.status === 200) {
                    response.body = JSON.parse(response.body);
                }

                return response;
            })
        };

        return next();
    }
}