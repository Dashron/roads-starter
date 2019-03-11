"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        id: {
            type:  DataTypes.INTEGER,
			primaryKey : true,
            autoIncrement : true
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        remoteId: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        expiresIn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 1
        }
    });
};