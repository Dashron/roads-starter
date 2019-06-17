module.exports = {
    "web": {
        "hostname": "",
        "port": 8080,
        "cognitoUrl": "",
        "cognitoClientId": "",
        "cognitoClientSecret": "",
        // cognitoJwks is located at https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
        "cognitoJwks": {},
        "cognitoRedirectUri": '',
        "secure": true,
        "secret": "",
        "authCookieName": "",
        "layoutPath": "",
        "pageNotFoundPath": "",
        "layoutConstants": {
            "GTM_ID": ""
        },
        "api": {
            "hostname": "api",
            "secure": false,
            "port": 8081,
            "external": {
                "hostname": "",
                "secure": true,
                "port": 443,
            }
        },
        "credentials": {
            "privateKey": "",
            "certificate": ""
        }
    },
    "api": {
        "hostname": "",
        "protocol": "http://",
        "port": 8081,
        "corsMethods": ["GET", "PUT", "POST", "DELETE", "PATCH"],
        "corsHeaders": ["content-type", "authorization"],
        "corsOrigins": [],
        "PGUSER": "",
        "PGPASSWORD": "",
        "PGPORT": "",
        "PGDATABASE": "",
        "PGHOST": "",
        "PGSSL": "",
        "secret": ""
    }
};