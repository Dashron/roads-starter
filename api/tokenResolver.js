"use strict";
let jwt = require('jsonwebtoken');

let {
    secret
} = require('../config/config.js');

module.exports = (token) => {
    // This isn't receiving the auth token for some reason. Maybe bearer isn't properly configured on the eventlist API?
    console.log('token', token);
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

