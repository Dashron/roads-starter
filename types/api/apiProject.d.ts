import { Router } from 'roads-api';
import { Sequelize } from 'sequelize';
import { Road } from 'roads';
import { Logger } from '../index';
import { StarterResourceConstructor } from './starterResource';
export interface APIProjectConfig {
    corsOrigins: Array<string>;
    corsHeaders: Array<string>;
    corsMethods: Array<string>;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD: string;
    PGHOST: string;
    PGPORT: number;
    PGSSL: string;
    cognitoUrl: string;
    cognitoPort: number;
    protocol: "http" | "https";
    port: number;
    host: string;
    hostname: string;
    credentials: {
        privateKey: string;
        certificate: string;
    };
    secret: string;
}
export declare type TokenResolver = (token: string) => Promise<any>;
export default class APIProject {
    protected road: Road;
    protected config: APIProjectConfig;
    protected logger: Logger;
    protected router: Router;
    protected connection: Sequelize;
    protected tokenResolver: Function;
    constructor(config: APIProjectConfig, logger: Logger);
    addModel(path: string): void;
    addResource(path: string, resource: StarterResourceConstructor, templateSchema?: any): void;
    addTokenResolver(resolverBuilder: (connection: Sequelize, logger: Logger, config: APIProjectConfig) => TokenResolver): void;
    addRoadsUserEndpoints(): void;
    start(): void;
    setup(): import("sequelize/types").Promise<Sequelize>;
}
