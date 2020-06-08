import { Road, RoadsPJAX } from 'roads';
import SimpleRouter from 'roads/types/middleware/simpleRouter';
import { Logger } from '../index';
interface ClientProjectConfig {
    api: {
        external: {
            secure: boolean;
            hostname: string;
            port: number;
        };
    };
    authCookieName: string;
}
export default class PrivateWebProject {
    road: Road;
    config: ClientProjectConfig;
    logger: Logger;
    pjax: RoadsPJAX;
    router: SimpleRouter;
    constructor(config: ClientProjectConfig, logger: Logger, document: Document, window: Window, mainContentElement: HTMLElement, pageNotFoundTemplate: () => string);
    attachRouter(): void;
    addRoutes(module: (router: SimpleRouter, config: ClientProjectConfig) => void): void;
    hasAllKeys(check: object, keys: Array<string>): boolean;
}
export {};
