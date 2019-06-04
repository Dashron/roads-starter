"use strict";

let Router = require('roads-api').Router;
let Server = require('roads-server').Server;
let Sequelize = require('sequelize');
let fs = require('fs');

let {
    Road,
    middleware,
    Response
} = require('roads');

function hasAllKeys(check, keys) {
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

module.exports = class APIProject {
    constructor (config, logger) {
        if (!hasAllKeys(config, ['hostname', 'protocol', 'corsHeaders', 'corsMethods',
                'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGHOST', 'PGPORT', 'PGSSL'
            ])) {

            throw new Error('Mising config key.');
        }
        
        this.road = new Road();
        this.config = config;
        this.logger = logger;

        let hostname = this.config.hostname;
        let protocol = this.config.protocol;

        let _self = this;
        this.road.use(function (method, url, body, headers, next) {
            _self.logger.info({
                method: method,
                url: url
            });
            
            return next();
        });

        this.road.use(middleware.cors({
            validOrigins: [protocol + hostname],
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

    addModel(path) {
        this.connection.import(path);
    }

    addResource(path, resource, templateSchema) {
        this.router.addResource(path, resource, templateSchema);
    }

    addRoadsUserEndpoints() {
        if (!hasAllKeys(this.config, ['secret', 'cognitoUrl'])) {
            throw new Error('Mising config key.');
        }

        this.addModel('./users/userModel.js');
        
        // I don't like passing in the connection like this
        this.addResource('/users/{remote_id}', require('./users/userResource.js')(this.connection, this.logger, this.config.secret, this.config.cognitoUrl), {
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

        let server = new Server(this.road, function (err) {
            log.error(err);
            
            switch (err.code) {
                case 404:
                    return new Response('Not Found', 404);
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

    setup() {
        return this.connection.sync();
    }
}