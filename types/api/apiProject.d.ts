import { Router, Resource } from 'roads-api';
import { Sequelize } from 'sequelize';
import { Road } from 'roads';
import { Logger } from '../index';
interface APIProjectConfig {
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
    hostname: string;
    credentials: {
        privateKey: string;
        certificate: string;
    };
}
export default class APIProject {
    protected road: Road;
    protected config: APIProjectConfig;
    protected logger: Logger;
    protected router: Router;
    protected connection: Sequelize;
    protected tokenResolver: Function;
    constructor(config: APIProjectConfig, logger: Logger);
    addModel(path: string): void;
    addResource(path: string, resource: Resource, templateSchema: any): void;
    addTokenResolver(resolver: Function): void;
    addRoadsUserEndpoints(): void;
    start(): void;
    setup(): import("sequelize/types").Promise<Sequelize>;
}
export {};
