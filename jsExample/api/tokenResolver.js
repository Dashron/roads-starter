"use strict";
let jwt = require('jsonwebtoken');

module.exports = (sequelize, logger, config) => {
    return async function (token) {
        try {
            let decoded = jwt.verify(token, config.secret, {
                algorithms: ['HS256']
            });

            if (decoded) {
                let user = await sequelize.models.User.findOne({
                    where: {
                        remoteId: decoded.val
                    }
                });

                if (user) {
                    return user;
                }

                return false;
            }
        } catch (e) {
            console.log('auth failure', e);
            return false;
        }
    };
};