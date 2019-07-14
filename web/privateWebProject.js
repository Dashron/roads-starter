"use strict";

var Server = require('roads-server').Server;
const fs = require('fs');
const path = require('path');

let {
    Road,
    middleware,
    Response
} = require('roads');

module.exports = class PrivateWebProject {
    constructor (config, logger, layoutWrapper, pageNotFoundTemplate) {
        if (!this.hasAllKeys(config, ['authCookieName', 'secure', 'secret', 'api', 'crsfCookieName'])) {
            throw new Error('Mising config key.');
        }

        this.road = new Road();
        this.config = config;
        this.logger = logger;

        let _self = this;
        this.road.use(function (method, url, body, headers, next) {
            _self.logger.info({
                method: method,
                url: url
            });
            
            return next();
        });

        this.road.use(middleware.killSlash);
        this.road.use(middleware.cookie());
        this.road.use(require('./middleware/csrfServer.js')(config.crsfCookieName));
        this.road.use(require('./middleware/addLayout.js')(layoutWrapper));
        this.road.use(require('./middleware/emptyTo404.js')(pageNotFoundTemplate));
        this.road.use(middleware.setTitle);
        this.road.use(middleware.parseBody);
        this.road.use(require('./middleware/api.js')(config.api.secure, config.api.hostname, config.api.port));
        this.road.use(require('./middleware/privateAuth.js')(config.authCookieName, this.logger, config.secret));

        this.router = new middleware.SimpleRouter(this.road);
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

    getRoad() {
        return this.road;
    }

    getRouter() {
        return this.router;
    }

    addRoutes(module) {
        if (typeof module === "string") {
            require(module)(this.router, this.config, this.logger);
        } else {
            module(this.router, this.config, this.logger);
        }
    }

    addStaticFile(urlPath, filePath, contentType, encoding='utf-8') {
        this.router.addRoute('GET', urlPath, function (url, body, headers) {
            this.ignore_layout = true;
            return new this.Response(fs.readFileSync(filePath).toString(encoding), 200, {
                'Content-Type': contentType + '; charset=' + encoding
            });
        });
    }

    addStaticFolder(rootPath, folderPath, contentType, encoding='utf-8') {
        let urlSeparator = '/';

        if (rootPath === '/') {
            throw new Error('I\'m pretty sure you don\'t want to mount your root directory');
        }

        if (rootPath[rootPath.length -1] === '/') {
            urlSeparator = '';
        }

        let files = fs.readdirSync(folderPath);

        for (let i = 0; i < files.length; i++) {

            this.logger.info('adding static file ' + files[i] + ' to ' + rootPath + urlSeparator + files[i]);
            this.addStaticFile(rootPath + urlSeparator + files[i], path.format({
                dir: folderPath,
                base: files[i]
            }), contentType, encoding);
        }
    }

    start() {
        let options = undefined;

        if (this.config.credentials) {
			options = {
                key: fs.readFileSync(this.config.credentials.privateKey).toString(), 
                cert: fs.readFileSync(this.config.credentials.certificate).toString()
            };
        }

        let log = this.logger;
        let server = new Server(this.road, function (err) {
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
        }, options);

        server.listen(this.config.port, () => {
            log.info('listening at ' + this.config.hostname + ':' + this.config.port);
        });
    }
}

