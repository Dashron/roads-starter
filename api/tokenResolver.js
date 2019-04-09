"use strict";
let jwt = require('jsonwebtoken');

let {
    secret
} = require('../config/config.js');

module.exports = (token) => {
    try {
        let decoded = jwt.verify(token, secret, {
            algorithms: ['HS256']
        });

        if (decoded) {
            return true;
        }
    } catch (e) {
        console.log('tokenResolver', e);
    }

    return null;
};

