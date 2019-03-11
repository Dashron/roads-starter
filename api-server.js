"use strict";

const Logger = require('./logger.js');
const log = Logger.createLogger('api');
let Router = require('roads-api').Router;
let { URL } = require('url');
let router = new Router();
var Server = require('roads-server').Server;
let CONFIG = require('./config/config.json');

let {
    Road,
    middleware
} = require('roads');

// Users
let userResource = require('./api/users/userResource.js');
router.addResource('/users/{remote_id}', userResource/*, {
    urlParams: {
        schema: {
            remote_id: {
                type: "string"
            }
        },
        required: ['remote_id']
    }
}*/);

/**
 * Create the webserver via roads. Maybe switch this to Koa or express instead.
 */
let road = new Road();

road.use(Logger.middleware);
road.use(middleware.cors({
    validOrigins: [CONFIG.web.protocol + CONFIG.web.hostname],
    requestHeaders: CONFIG.api.corsHeaders,
    validMethods: CONFIG.api.corsMethods,
    supportsCredentials: true
}));

let hostname = CONFIG.api.hostname;
let protocol = CONFIG.api.protocol;
let port = CONFIG.api.port;

road.use(async function (requestMethod, requestUrl, requestBody, requestHeaders) {
    // temp until roads uses the new url object
    requestUrl = new URL(protocol + hostname + requestUrl);

    let routeResponse = yield router.locateResource(requestUrl);
    
    if (!routeResponse) {
        return new this.Response({"error": "not found"}, 404);
    }

    let resource = new routeResponse.resource();
    let response = yield resource.resolve(requestMethod, requestUrl, routeResponse.urlParams, requestBody, requestHeaders);
    return new this.Response(response.body, response.status, response.headers);
});

let server = new Server(road, function (err) {
	log.error(err);
	
	switch (err.code) {
		case 404:
			return new roads.Response('Not Found', 404);
		case 405:
			return new roads.Response('Not Allowed', 405);
		default:
		case 500:
			return new roads.Response('Unknown Error', 500);
	}
});

server.listen(port, () => {
    log.log('listening at ' + hostname + ':' + port);
});