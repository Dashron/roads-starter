// TODO: Set up this connection so we don't get a web startup until it's connected (maybe something in the server.js)
// TODO: Set up this connection so it's accessible by all the model functions
// TODO: Build the timelineModel and have it use this db
// TODO: Should db setup be part of docker init? That sounds like the right choice. Have it be "if not exists create"
const Sequelize = require('sequelize');
let connection = null;
let config = require('../config/dbconf.json');
const fs = require('fs');

module.exports.getConnectedClient = () => {
    if (connection) {
        return connection;
    }

    connection = new Sequelize(config.PGDATABASE, config.PGUSER, config.PGPASSWORD, {
        host: config.PGHOST,
        dialect: "postgres",
        port: config.PGPORT,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
                ssl: {
                rejectUnauthorized: true,
                ca: fs.readFileSync(config.PGSSL).toString()
            },
        },
        operatorsAliases: false
    });
    
    connection.import('./users/userModel.js');

    return connection;
};

module.exports.setup = () => {
    return module.exports.getConnectedClient()
    .sync({
        //"force": true
    })
    .then(function() {
        console.log('dbs created');
        return module.exports.getConnectedClient();
	})
	.catch(function (err) {
            throw err;
    });
};