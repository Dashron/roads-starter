import { Server } from 'roads-server';
import * as fs from 'fs';
import * as path from 'path';

import { Road, Response } from 'roads';
import { Middleware } from 'roads';
import SimpleRouter, { SimpleRouterURL } from 'roads/types/middleware/simpleRouter';
import { Context } from 'roads/types/core/road';
import { Logger } from '../index';

import csrfServer from './middleware/csrfServer';
import addLayout, { LayoutWrapper } from'./middleware/addLayout';
import emptyTo404 from './middleware/emptyTo404';
import apiMiddleware from './middleware/api';
import privateAuth from './middleware/privateAuth';


export interface PrivateWebProjectConfig {
    csrfCookieName: string,
    api: {
        secure: boolean,
        hostname: string,
        host: string,
        port: number
    },
    secret: string,
    authCookieName: string,
    hostname: string,
    host: string,
    port: number,
    credentials: {
        certificate: string,
        privateKey: string
    }
}

export default class PrivateWebProject {
    road: Road;
    config: PrivateWebProjectConfig;
    logger: Logger;
    router: SimpleRouter;

    constructor (config: PrivateWebProjectConfig, logger: Logger, layoutWrapper: LayoutWrapper, pageNotFoundTemplate: () => string) {
        if (!this.hasAllKeys(config, ['authCookieName', 'secure', 'secret', 'api', 'csrfCookieName'])) {
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

        this.road.use(Middleware.killSlash);
        this.road.use(Middleware.cookie);
        this.road.use(csrfServer(config.csrfCookieName));
        this.road.use(addLayout(layoutWrapper));
        this.road.use(emptyTo404(pageNotFoundTemplate));
        this.road.use(Middleware.setTitle);
        this.road.use(Middleware.parseBody);
        this.road.use(apiMiddleware(config.api.secure, config.api.hostname, config.api.port));
        this.road.use(privateAuth(config.authCookieName, this.logger, config.secret));

        this.router = new Middleware.SimpleRouter();
    }

    // todo: shared root project object
    hasAllKeys(check: object, keys: Array<string>) {
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

    addRoutes(module: (router: SimpleRouter, config: object, logger: Logger) => void) {
        if (typeof module === "string") {
            require(module)(this.router, this.config, this.logger);
        } else {
            module(this.router, this.config, this.logger);
        }
    }

    addStaticFile(urlPath: string, filePath: string, contentType: string, encoding='utf-8') {
        this.router.addRoute('GET', urlPath, function (this: Context, url: SimpleRouterURL, body: string, headers: {[x: string]: string}) {
            this.ignore_layout = true;
            return Promise.resolve(new this.Response(fs.readFileSync(filePath).toString(encoding), 200, {
                'Content-Type': contentType + '; charset=' + encoding
            }));
        });
    }

    addStaticFolder(rootPath: string, folderPath: string, contentType: string, encoding='utf-8') {
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
        let server = new Server(this.road, function (err: Error) {
            log.error(err);
            return new Response('Unknown Error', 500);
        }, options);

        this.router.applyMiddleware(this.road);
        server.listen(this.config.port, this.config.host);
    }
}

