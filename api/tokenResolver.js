"use strict";
let jwt = require('jsonwebtoken');

module.exports = (sequelize, secret) => {
    return async function (token) {
        try {
            let decoded = jwt.verify(token, secret, {
                algorithms: ['HS256']
            });

            if (decoded) {
                let user = await sequelize.models.user.findOne({
                    where: {
                        id: decoded.val
                    }
                });

                if (user) {
                    return user;
                }

                return false;
            }
        } catch (e) {
            console.log('tokenResolver', e);
        }

        return null;
    };
};