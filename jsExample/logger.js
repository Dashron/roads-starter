"use strict";

let logs = {};
/**
 * This is a super simple logger for the purposes of this example. Every function used in this example is used by roads, and expected to exist in the logging
 * object that you provide to the projects
 */
module.exports.createLogger = function createLogger(logName) {
    if (logs[logName]) {
        return logs[logName];
    }

    return logs[logName] = {
        log: (text) => {
            if (typeof text === "object") {
                text = JSON.stringify(text);
            }

            console.log('LOG: ' + text);
        },
        info: (text) => {
            if (typeof text === "object") {
                text = JSON.stringify(text);
            }

            console.log('INFO: ' + text);
        },
        warn: (text) => {
            if (typeof text === "object") {
                text = JSON.stringify(text);
            }

            console.log('WARN: ' + text);
        },
        error: (error) => {
            console.log('LOG ERROR: ' + error.stack);
        }
    };
};