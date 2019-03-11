"use strict";

let {
    Client
} = require('roads');

let CONFIG = require('../../config/config.json');
let apiPort = CONFIG.api.port;

// Add an "api" function to the request context that makes HTTP requests to the API
// todo: Should this have a hostname?
let apiClient = new Client('api', apiPort);
module.exports = middleware.applyToContext('api', function (method, path, body, headers) {
    return apiClient.request(method, path, body, headers)
    .then((response) => {
        // todo: this should check the response content type and only parse app/json type
        if (response.status === 200) {
            response.body = JSON.parse(response.body);
        }

        return response;
    })
});