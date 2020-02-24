import { Router, Resource } from 'roads-api';
import { Sequelize } from 'sequelize';
import { Road } from 'roads';
declare type APIProjectConfig = {
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
    protocol: "http" | "https";
    port: number;
    hostname: string;
    credentials: {
        privateKey: string;
        certificate: string;
    };
};
declare type Logger = {
    info: (param: any) => void;
    error: (err: Error) => void;
};
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
    setup(): any;
}
export {};
