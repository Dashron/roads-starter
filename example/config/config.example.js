module.exports = {
    "web": {
        "hostname": "",
        "port": 8080,
        "cognitoUrl": "",
        "cognitoClientId": "",
        "cognitoClientSecret": "",
        "cognitoJwks": {},
        "secure": true,
        "secret": "",
        "authCookieName": "",
        "layoutPath": "",
        "pageNotFoundPath": "",
        "layoutConstants": {
            "GTM_ID": ""
        },
        "api": {
            "hostname": "",
            "secure": false,
            "port": 8081
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
        "PGUSER": "",
        "PGPASSWORD": "",
        "PGPORT": "",
        "PGDATABASE": "",
        "PGHOST": "",
        "PGSSL": "",
        "logger": "",
        "secret": ""
    }
};