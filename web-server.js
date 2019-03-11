"use strict";

const Logger = require('./logger.js');
const log = Logger.createLogger('web');
const CONFIG = require('config/config.json');
var Server = require('roads-server').Server;

let {
    Road,
    middleware,
    Response
} = require('roads');

var road = new Road();

road.use(Logger.middleware);
road.use(middleware.killSlash);
road.use(middleware.cookie());
road.use(require('./web/addLayout.js'));
road.use(middleware.setTitle);
road.use(middleware.parseBody);
road.use(require('./web/middleware/api.js'));
road.use(require('./web/middleware/auth.js'));

let router = new middleware.SimpleRouter(road);
require('./web/applyStaticRoutes.js')(router);
require('./web/applyPublicRoutes.js')(router);
require('./web/applyPrivateRoutes.js')(router);

let webHostname = CONFIG.web.hostname;
let webPort = CONFIG.web.port;

let server = new Server(road, function (err) {
	log.error(err);
	
	switch (err.code) {
		case 404:
			return new Response(err.htmlMessage ? err.htmlMessage : 'Page not found', 404);
		case 405:
			return new Response('Not Allowed', 405);
		default:
		case 500:
			return new Response('Unknown Error', 500);
	}
});

server.listen(webPort, () => {
    log.log('listening at ' + webHostname + ':' + webPort);
});
