import { User } from "./userModel";
import { WritableRepresentation } from "roads-api/types/Representation/representation";
import { ParsedURLParams, ActionList } from "roads-api/types/Resource/resource";
import { Resource, HTTPErrors, CONSTANTS } from 'roads-api';
import { Request } from 'roads';

const { NotFoundError, InvalidRequestError, ForbiddenError } = HTTPErrors;
const { MEDIA_JSON, MEDIA_JSON_MERGE, AUTH_BEARER } = CONSTANTS;


export class UserResource extends Resource {
    constructor() {
        super({
            authSchemes: { [AUTH_BEARER]: tokenResolver },
            responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js.js') },
            defaultResponseMediaType: MEDIA_JSON,
            defaultRequestMediaType: MEDIA_JSON,
            authRequired: true
        }, ["get"]);

        this.addAction("fullReplace", {
            authSchemes: { [AUTH_BEARER]: tokenResolver },
            requestMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js.js') },
            responseMediaTypes: { [MEDIA_JSON]: require('./userRepresentation.js.js') },
            defaultRequestMediaType: MEDIA_JSON,
            defaultResponseMediaType: MEDIA_JSON,
            // todo: currently we just validate that the user id exists. this makes it hard to create users without getting amazon involved
            // ideally as an extra step we would require auth on this, and force clients to get a client auth token before adding users.
            authRequired: false
        });
        
        this.addAction("partialEdit", {
            authSchemes: { [AUTH_BEARER]: tokenResolver },
            requestMediaTypes: { [MEDIA_JSON_MERGE]: require('./userRepresentation.js.js') },
            defaultRequestMediaType: MEDIA_JSON_MERGE,
            authRequired: true
        });

        this.addAction("delete", {
            authSchemes: { [AUTH_BEARER]: tokenResolver },
            authRequired: true
        });
    }

    async modelsResolver(urlParams: ParsedURLParams, searchParams: URLSearchParams | undefined, action: keyof ActionList, pathname: string) {
        let user = await dbConnection.models.user.findOne({
            where: {
                remoteId: urlParams.remote_id
            }
        });
        
        if (user) {
            return user;
        }

        if (action === 'fullReplace') {
            return dbConnection.models.user.build({
                remoteId: urlParams.remote_id,
                active: 1
            });
        }
        
        throw new NotFoundError("User not found");
    }

    get (models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User) {
        // You can only view your own user page
        if (!auth || auth.id != models.id) {
            throw new ForbiddenError('You do not have permission to view this resource');
        }
    }

    partialEdit (models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User) {
        // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
        // this would be a good location to check auth roles
        if (!auth || auth.id != models.id) {
            throw new ForbiddenError('You do not have permission to manipulate this resource');
        }

        requestMediaHandler.applyEdit(requestBody, models, auth);
        return models.save();
    }


    async fullReplace (models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User) {
        if (!requestBody) {
            throw new InvalidRequestError('Credentials must be provided for this user');
        }

        // Ensure that the user being registered via amazon cognito actually exists in amazon cognito. 
        // This is a lightweight check to ensure all data to this endpoint is valid, as opposed to forcing some form of authentication on this endpoint 
        // Note: this might be better as a part of the userRepresentation Validation. Maybe a new "validate multi" function or something.
        let cognitoRequest = new Request(true, cognitoUrl, cognitoPort);
        let authResponse = await cognitoRequest.request('GET', '/oauth2/userInfo', undefined, {
            'authorization': 'Bearer ' + requestBody.getRequestBody().accessToken
        });

        let parsedResponse = JSON.parse(authResponse.body);
        if (authResponse.status != 200 || parsedResponse.sub != models.remoteId) {
            throw new InvalidRequestError('Invalid credentials provided for this user');
        }

        await requestMediaHandler.applyEdit(requestBody, models, auth);
        return models.save();
    }

    delete (models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User) {
        // auth is valid if we get to this point, but I'm checking for auth here to protect against bugs
        // this would be a good location to check auth roles
        if (!auth || auth.id != models.id) {
            throw new ForbiddenError('You do not have permission to manipulate this resource');
        }

        models.active = 0;
        return models.save();
    }
};

// Not a big fan of this method for passing the connection
module.exports = function (dbConnection, logger, tokenResolver, cognitoUrl) {
    
};