import { Road } from 'roads';
import SimpleRouter from 'roads/types/middleware/simpleRouter';
import { Logger } from '../index';
interface PrivateWebProjectConfig {
    csrfCookieName: string;
    api: {
        secure: boolean;
        hostname: string;
        port: number;
    };
    secret: string;
    authCookieName: string;
    hostname: string;
    port: number;
    credentials: {
        certificate: string;
        privateKey: string;
    };
}
export default class PrivateWebProject {
    road: Road;
    config: PrivateWebProjectConfig;
    logger: Logger;
    router: SimpleRouter;
    constructor(config: PrivateWebProjectConfig, logger: Logger, layoutWrapper: Function, pageNotFoundTemplate: Function);
    hasAllKeys(check: object, keys: Array<string>): boolean;
    getRoad(): Road;
    getRouter(): SimpleRouter;
    addRoutes(module: (router: SimpleRouter, config: object, logger: Logger) => void): void;
    addStaticFile(urlPath: string, filePath: string, contentType: string, encoding?: string): void;
    addStaticFolder(rootPath: string, folderPath: string, contentType: string, encoding?: string): void;
    start(): void;
}
export {};
