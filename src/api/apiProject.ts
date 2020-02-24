"use strict";

import { Router, Resource } from 'roads-api';
import { Server } from 'roads-server';
import { Sequelize } from 'sequelize';
import * as fs from 'fs';

import {
    Road,
    Response,
    Middleware
} from 'roads';

function hasAllKeys(check: object, keys: Array<string>) {
    if (!check) {
        return false;
    }
    
    let checkKeys = Object.keys(check);

    for (let i = 0; i < keys.length; i++) {
        if (!checkKeys.includes(keys[i])) {
            return false;
        }
    }

    return true;
}

type APIProjectConfig = {
    corsOrigins: Array<string>,
    corsHeaders: Array<string>,
    corsMethods: Array<string>,
    PGDATABASE: string, 
    PGUSER: string, 
    PGPASSWORD: string,
    PGHOST: string,
    PGPORT: number,
    PGSSL: string,
    cognitoUrl: string,
    protocol: "http" | "https",
    port: number,
    hostname: string,
    credentials: {
        privateKey: string,
        certificate: string
    }
}

type Logger = {
    info: (param: any) => void,
    error: (err: Error) => void
}

export default class APIProject {
    protected road: Road;
    protected config: APIProjectConfig;
    protected logger: Logger;
    protected router: Router;
    protected connection: Sequelize;
    protected tokenResolver: Function;

    constructor (config: APIProjectConfig, logger: Logger) {
        if (!hasAllKeys(config, ['hostname', 'protocol', 'corsOrigins', 'corsHeaders', 'corsMethods',
                'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGHOST', 'PGPORT', 'PGSSL'
            ])) {

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

        this.road.use(Middleware.cors({
            validOrigins: this.config.corsOrigins,
            requestHeaders: this.config.corsHeaders,
            validMethods: this.config.corsMethods,
            supportsCredentials: true
        }));

        this.router = new Router();
        this.connection = new Sequelize(this.config.PGDATABASE, this.config.PGUSER, this.config.PGPASSWORD, {
            host: this.config.PGHOST,
            dialect: "postgres",
            port: this.config.PGPORT,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                    ssl: {
                    rejectUnauthorized: true,
                    ca: fs.readFileSync(this.config.PGSSL).toString()
                },
            }
        });
    }

    addModel(path: string) {
        this.connection.import(path);
    }

    addResource(path: string, resource: Resource, templateSchema: any) {
        this.router.addResource(path, resource, templateSchema);
    }

    addTokenResolver(resolver: Function) {
        this.tokenResolver = resolver;
    }

    addRoadsUserEndpoints() {
        if (!hasAllKeys(this.config, ['secret', 'cognitoUrl'])) {
            throw new Error('Mising config key.');
        }

        this.addModel('./users/userModel.js');
        
        // I don't like passing in the connection like this
        this.addResource('/users/{remote_id}', require('./users/userResource.js.js')(this.connection, this.logger, this.tokenResolver, this.config.cognitoUrl), {
            urlParams: {
                schema: {
                    remote_id: {
                        type: "string"
                    }
                },
                required: ['remote_id']
            }
        });
    }
    
    start() {
        this.road.use(this.router.middleware(this.config.protocol, this.config.hostname));
        let log = this.logger;

        let options = undefined;

        if (this.config.credentials) {
            options = {
                key: fs.readFileSync(this.config.credentials.privateKey).toString(),
                cert: fs.readFileSync(this.config.credentials.certificate).toString()
            };
        }

        let server = new Server(this.road, function (err: Error) {
            log.error(err);
            return new Response('Unknown Error', 500);
        }, options);
        
        server.listen(this.config.port, this.config.hostname);
    }

    setup() {
        return this.connection.sync();
    }
}