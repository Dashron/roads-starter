let ClientProject = require('../web/clientProject.js');
//let ClientProject = require('roads-starter/clientProject');
let fs = require('fs');
let handlebars = require('handlebars');

let client = new ClientProject({
    secure: process.env.ROADS_SECURE,
    hostname: process.env.ROADS_HOSTNAME,
    port: process.env.ROADS_PORT,
    cognitoClientId: process.env.ROADS_COGNITO_CLIENT_ID,
    cognitoUrl: process.env.ROADS_COGNITO_URL,
    cognitoRedirectUri: process.env.ROADS_COGNITO_REDIRECT_URI,
    authCookieName: process.env.ROADS_AUTH_COOKIE_NAME,
    api: {
        external: {
            secure: process.env.ROADS_EXTERNAL_API_SECURE,
            hostname: process.env.ROADS_EXTERNAL_API_HOSTNAME,
            port: process.env.ROADS_EXTERNAL_API_PORT
        }
    }
},  console, document, window, document.getElementById('main-content'));

let loginTemplate = fs.readFileSync('./web/templates/loginUrl.hbs').toString('utf-8');
let profileTemplate = fs.readFileSync('./web/templates/profile.hbs').toString('utf-8');

client.addRoutes(require('../web/publicUserRoutes.js')(handlebars.compile(profileTemplate), handlebars.compile(loginTemplate)));