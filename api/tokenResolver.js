"use strict";
let jwt = require('jsonwebtoken');

module.exports = (secret) => {
    return (token) => {
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
};