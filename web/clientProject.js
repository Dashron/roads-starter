"use strict";

require("regenerator-runtime/runtime");

var roads = require('roads');

// todo: fix config, figure out how to do this without the browser compling all the secure shit
module.exports = class PrivateWebProject {
    constructor (config, logger, document, window, mainContentElement) {
        // todo: require api.external.source, hostname and port
        if (!this.hasAllKeys(config, ['secure', 'hostname', 'port', 'authCookieName', 'cognitoClientId', 'cognitoUrl', 'cognitoRedirectUri', 'api'])) {
            throw new Error('Mising config key.');
        }

        this.road = new roads.Road();
        this.config = config;
        this.logger = logger;
        
        let _self = this;
        this.road.use(function (method, url, body, headers, next) {
            _self.logger.info({
                method: method,
                url: url,
                body: body,
                headers: headers
            });
            
            return next();
        });

        this.road.use(roads.middleware.parseBody);
        this.road.use(roads.middleware.emptyTo404);
        this.road.use(require('./middleware/api.js')(config.api.external.secure, config.api.external.hostname, config.api.external.port));

        var pjax = new roads.PJAX(this.road, mainContentElement, window);
        pjax.addTitleMiddleware();
        pjax.addCookieMiddleware(document);
        pjax.register();

        this.road.use(require('./middleware/publicAuth.js')(config.authCookieName, console));

        this.router = new roads.middleware.SimpleRouter(this.road);
    }


    addRoutes(module) {
        module(this.router, this.config);
    }

    // todo: shared root project object
    hasAllKeys(check, keys) {
        let checkKeys = Object.keys(check);
    
        for (let i = 0; i < keys.length; i++) {
            if (!checkKeys.includes(keys[i])) {
                return false;
            }
        }
    
        return true;
    }
}
