"use strict";

const fs = require('fs');
const path = require('path');

module.exports = function (folderPath, environment) {
    let files = fs.readdirSync(folderPath);
    let environmentConfig = {};
    let defaultConfig = {};

    for (let i = 0; i < files.length; i++) {
        if (files[i] === "config." + environment + ".js") {
            environmentConfig = require(path.format({
                dir: folderPath,
                base: files[i]
            }));
            break;
        }
    }

    if (fs.existsSync(path.format({
        dir: folderPath,
        base: 'config.default.js'
    }))) {
        defaultConfig = require(path.format({
            dir: folderPath,
            base: 'config.default.js'
        }));
    }

    return merge(defaultConfig, environmentConfig);
}

function merge(base, overrides) {
    if (typeof base != "object") {
        base = overrides;
    } else {
        for (let key in overrides) {
            if (typeof overrides[key] === "object") {
                base[key] = merge(base[key], overrides[key]);
            } else {
                base[key] = overrides[key];
            }
        }
    }

    return base;
}