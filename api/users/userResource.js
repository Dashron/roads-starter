"use strict";

const { Resource } = require('roads-api');
const { NotFoundError, InvalidRequestError, ForbiddenError } = require('roads-api').HTTPErrors;
const { MEDIA_JSON, MEDIA_JSON_MERGE, AUTH_BEARER } = require('roads-api').CONSTANTS;
const roadsReq = require('roads-req');

// Not a big fan of this method for passing the connection
module.exports = function (dbConnection, logger, secret, cognitoUrl) {
    return class UserResource extends Resource {
        constructor() {
            super({
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(dbConnection, logger, secret) },
                responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                defaultResponseMediaType: MEDIA_JSON,
                defaultRequestMediaType: MEDIA_JSON,
                authRequired: true
            }, ["get"]);

            this.addAction("fullReplace", {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(dbConnection, logger, secret) },
                requestMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                defaultRequestMediaType: MEDIA_JSON,
                defaultResponseMediaType: MEDIA_JSON,
                // todo: currently we just validate that the user id exists. this makes it hard to create users without getting amazon involved
                // ideally as an extra step we would require auth on this, and force clients to get a client auth token before adding users.
                authRequired: false
            });
            
            this.addAction("partialEdit", {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(dbConnection, logger, secret) },
                requestMediaTypes: { [MEDIA_JSON_MERGE]: require('./userRepresentation.js') },
                defaultRequestMediaType: MEDIA_JSON_MERGE,
                authRequired: true
            });

            this.addAction("delete", {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js') },
                authRequired: true
            });
        }

        async modelsResolver(urlParams, searchParams, method, url) {
            let user = await dbConnection.models.user.findOne({
                where: {
                    remoteId: urlParams.remote_id
                }
            });
            
            if (user) {
                return user;
            }

            if (method === 'fullReplace') {
                return dbConnection.models.user.build({
                    remoteId: urlParams.remote_id,
                    active: 1
                });
            }
            
            throw new NotFoundError();
        }

        get (models, requestBody, auth) {
            // You can only view your own user page
            if (!auth || models.id != auth.id) {
                throw new ForbiddenError('You do not have permission to view this resource');
            }
        }

        partialEdit (models, requestBody, auth) {
            // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
            // this would be a good location to check auth roles
            if (auth) {
                requestBody.applyEdit(models, auth);
                return models.save();
            } else {
                throw new ForbiddenError('You do not have permission to manipulate this resource');
            }
        }


        async fullReplace (models, requestBody, auth) {
            if (!requestBody) {
                throw new InvalidRequestError('Invalid credentials provided for this user');
            }

            // Ensure that the user being registered via amazon cognito actually exists in amazon cognito. 
            // This is a lightweight check to ensure all data to this endpoint is valid, as opposed to forcing some form of authentication on this endpoint 
            // Note: this might be better as a part of the userRepresentation Validation. Maybe a new "validate multi" function or something.
            let authResponse = await roadsReq.request({
                request: {
                    method: 'GET',
                    protocol: 'https:',
                    hostname: cognitoUrl,
                    path: '/oauth2/userInfo',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'authorization': 'Bearer ' + requestBody.getRequestBody().accessToken
                    },
                }
            });

            if (authResponse.response.statusCode != 200 || authResponse.body.sub != models.remoteId) {
                throw new InvalidRequestError('Invalid credentials provided for this user');
            }

            await requestBody.applyEdit(models, auth);
            return models.save();
        }

        delete (models, requestBody, auth) {
            // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
            // this would be a good location to check auth roles
            if (auth) {
                models.active = 0;
                return models.save();
            } else {
                throw new ForbiddenError('You do not have permission to manipulate this resource');
            }
        }
    };
};