let roadsStarter = require('../index.js');
let config = require('./config/config.json');

// TODO: Maybe all projects should have an init call that sets up router and roads and stuff, like public web. this allows for consistency, and likely better testing too
let api = new roadsStarter.APIProject(config.api);
console.log('api created');
api.addRoadsUserEndpoints();
api.start();
/*
let privateWeb = new roadsStarter.PrivateWebProject({
    cognitoJwks: '',
    hostname: '',
    port: '',
    cognitoClientId: '',
    cognitoClientSecret: '',
    secure: '',
    domain: '',
    secret: '',
    authCookieName: ''
});

privateWeb.addRoadsUserFunctionality();
privateWeb.start();*/

/*
let publicWeb = new roadsStarter.PublicWebProject(privateWeb.getRoad(), privateWeb.getRouter(), {});
publicWeb.start();
*/