"use strict";

const Logger = require('../logger.js');
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
    let checkKeys = Object.keys(check);

    for (let i = 0; i < keys.length; i++) {
        if (!checkKeys.includes(keys[i])) {
            return false;
        }
    }

    return true;
}

module.exports = class APIProject {
    constructor (config) {
        if (!hasAllKeys(config, ['logger', 'hostname', 'protocol', 'corsHeaders', 'corsMethods',
                'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGHOST', 'PGPORT', 'PGSSL'
            ])) {

            throw new Error('Mising config key.');
        }
        
        this.road = new Road();
        this.config = config;
        this.logger = Logger.createLogger(config.logger);

        let hostname = this.config.hostname;
        let protocol = this.config.protocol;

        this.road.use(Logger.middleware('api-server'));
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
            },
            operatorsAliases: false
        });
        console.log('connection set');
    }

    addModel(path) {
        this.connection.import(path);
    }

    addResource(path, resource, templateSchema) {
        this.router.addResource(path, resource, templateSchema);
    }

    addRoadsUserEndpoints() {
        if (!hasAllKeys(this.config, ['secret'])) {
            
        throw new Error('Mising config key.');
    }
        this.addModel('./users/userModel.js');

        // I don't like passing in the connection like this
        this.addResource('/users/{remote_id}', require('./users/userResource.js')(this.connection, this.config.secret), {
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
        });
        
        server.listen(this.config.port, () => {
            log.log('listening at ' + this.config.hostname + ':' + this.config.port);
        });
    }

    setup() {
        return this.connection.sync({
            //"force": true
        })
        .then(function() {
            console.log('dbs created');
            return module.exports.getConnectedClient();
        })
        .catch(function (err) {
                throw err;
        });
    }
}