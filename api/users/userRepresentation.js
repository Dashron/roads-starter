"use strict";

const JSONRepresentation = require('roads-api').JSONRepresentation;
let moment = require('moment');

module.exports = class UserRepresentation extends JSONRepresentation {
    constructor (requestBody, requestAuth) {
        super({
            "type": "object",
            "properties": {
                "id": {
                    "type": "number",
                    "roadsReadOnly": true,
                    "resolve": (models) => {
                        return models.id;
                    }
                },
                "createdTime": {
                    "type": "string",
                    "resolve": (models) => {
                        return models.createdAt;
                    },
                    "set": (models, time, requestAuth) => {
                        models.createdAt = moment(time).format();
                    },
                    "format": "iso8601date"
                },
                "accessToken": {
                    "type": "string",
                    "resolve": (models) => {
                        return models.accessToken;
                    },
                    "set": (models, accessToken, requestAuth) => {
                        models.accessToken = accessToken;
                    }
                },
                "refreshToken": {
                    "type": "string",
                    "resolve": (models) => {
                        return models.refreshToken;
                    },
                    "set": (models, refreshToken, requestAuth) => {
                        models.refreshToken = refreshToken;
                    }
                },
                "remoteId": {
                    "type": "string",
                    "resolve": (models) => {
                        return models.remoteId;
                    },
                    "set": (models, remoteId, requestAuth) => {
                        models.remoteId = remoteId;
                    }
                },
                "expiresIn": {
                    "type": "number",
                    "resolve": (models) => {
                        return models.expiresIn;
                    },
                    "set": (models, expiresIn, requestAuth) => {
                        models.expiresIn = expiresIn;
                    }
                },
                "active": {
                    "type": "boolean",
                    "resolve": (models) => {
                        return models.active == 1 ? true : false;
                    },
                    "set": (models, active, requestAuth) => {
                        models.active = active ? 1 : 0;
                    }
                }
            },
            "additionalProperties": false
        }, {
            formats: {
                "iso8601date": (value) => {
                    try {
                        moment(value);
                        return true;
                    } catch (e) {
                        return false;
                    }
                } 
            }
        });

        this.setRequestBody(requestBody);
    }
};