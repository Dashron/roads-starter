require("regenerator-runtime/runtime");
import { Road, RoadsPJAX } from 'roads';
import { Middleware } from 'roads';
import SimpleRouter from 'roads/types/middleware/simpleRouter';
import { Logger } from '../index';
import emptyTo404 from './middleware/emptyTo404';
import apiMiddleware from './middleware/api';
import csrfClientONLY from './middleware/csrfClientONLY'
import publicAuth from './middleware/publicAuth';

interface ClientProjectConfig {
    api: {
        external: {
            secure: boolean,
            hostname: string,
            port: number
        }
    },
    authCookieName: string
}

// todo: fix config, figure out how to do this without the browser compling all the secure shit
export default class PrivateWebProject {
    road: Road;
    config: ClientProjectConfig;

    logger: Logger;
    pjax: RoadsPJAX;
    router: SimpleRouter;

    constructor (config: ClientProjectConfig, logger: Logger, document: Document, window: Window, mainContentElement: HTMLElement, pageNotFoundTemplate: () => string) {
        // todo: require api.external.source, hostname and port
        if (!this.hasAllKeys(config, ['secure', 'hostname', 'port', 'authCookieName', 'cognitoClientId', 'cognitoUrl', 'cognitoRedirectUri', 'api'])) {
            throw new Error('Mising config key.');
        }

        this.road = new Road();
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

        this.road.use(Middleware.parseBody);
        this.road.use(emptyTo404(pageNotFoundTemplate));
        this.road.use(apiMiddleware(config.api.external.secure, config.api.external.hostname, config.api.external.port));
        this.road.use(csrfClientONLY);

        this.pjax = new RoadsPJAX(this.road, mainContentElement, window);
        this.pjax.addTitleMiddleware();
        this.pjax.addCookieMiddleware(document);
        this.pjax.register();

        this.road.use(publicAuth(config.authCookieName, console));

        this.router = new Middleware.SimpleRouter(this.road);
    }


    addRoutes(module: (router: SimpleRouter, config: ClientProjectConfig) => void) {
        module(this.router, this.config);
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
}

