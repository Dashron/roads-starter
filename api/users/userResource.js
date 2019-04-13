"use strict";

const { Resource } = require('roads-api');
const { NotFoundError, InvalidRequestError } = require('roads-api').HTTPErrors;
const { MEDIA_JSON, MEDIA_JSON_MERGE, AUTH_BEARER } = require('roads-api').CONSTANTS;

// Not a big fan of this method for passing the connection
module.exports = function (dbConnection, config) {
    return class UserResource extends Resource {
        constructor() {
            super({
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(config.secret) },
                responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                defaultResponseMediaType: MEDIA_JSON,
                defaultRequestMediaType: MEDIA_JSON,
                authRequired: false
            }, ["get"]);

            this.addAction("fullReplace", {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(config.secret) },
                requestMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js') },
                defaultRequestMediaType: MEDIA_JSON,
                defaultResponseMediaType: MEDIA_JSON,
                authRequired: false
            });
            
            this.addAction("partialEdit", {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js')(config.secret) },
                requestMediaTypes: { [MEDIA_JSON_MERGE]: require('./userRepresentation.js') },
                defaultRequestMediaType: MEDIA_JSON_MERGE,
                authRequired: true
            });

            this.addAction('delete', {
                authSchemes: { [AUTH_BEARER]: require('../tokenResolver.js') },
                authRequired: true
            });
        }

        async modelsResolver(urlParams, searchParams, method, url) {
            //TODO: hmm... how to get the connection into this
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

        get () {
            // do dee doo. nothing to see here but we need it anyway. Is there a better solution for this?
        }

        partialEdit (models, requestBody, auth) {
            // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
            // this would be a good location to check auth roles
            if (auth) {
                requestBody.applyEdit(models, auth);
                return models.save();
            }
        }


        async fullReplace (models, requestBody, auth) {
            await requestBody.applyEdit(models, auth);
            return models.save();
        }

        delete (models, requestBody, auth) {
            // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
            // this would be a good location to check auth roles
            if (auth) {
                models.active = 0;
                return models.save();
            }
        }
    };
};