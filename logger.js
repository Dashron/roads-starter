// Todo: Bring back google cloud client library using the proper config workflow

// Imports the Google Cloud client library
//const {Logging} = require('@google-cloud/logging');

// Creates a client
//const logging = new Logging({
//    projectId: require('./config/stackdriver.json').project_id
//});

let logs = {};

module.exports.middleware = function (logName) {
    let log = module.exports.createLogger(logName);

    return function (method, url, body, headers, next) {
        log.logJSON({
            method: method,
            url: url
        });
        return next();
    }
};

module.exports.createLogger = function createLogger(logName) {
    //if (!logs[logName]) {
    //    logs[logName] = logging.log(logName);
    //}

    return {
        log: (text) => {
            console.log('LOG: ' + text);

            /*let entry = logs[logName].entry(null, {
                "text": text
            });

            return logs[logName].write(entry)
            .catch((err) => {
                console.log(err);
            });*/
        },
        logJSON: (object) => {
            console.log('LOG JSON: ' + JSON.stringify(object));

            /*let entry = logs[logName].entry(null, object);

            return logs[logName].write(entry)
            .catch((err) => {
                console.log(err);
            });*/
        },
        error: (error) => {
            console.log('LOG ERROR: ' + error.stack);
            
            /*let entry = logs[logName].entry(null,  {
                "message": error.message,
                "stack": error.stack
            });

            return logs[logName].write(entry)
            .catch((err) => {
                console.log(err);
            });*/

            /*
            return errors.report(error, (err) => {
                console.log(err);
            });*/
        }
    };
};