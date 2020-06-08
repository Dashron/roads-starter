"use strict";

let ClientProject = require('roads-starter/web/clientProject').default;
let publicUserRoutes = require('roads-starter/web/publicUserRoutes').default;

import * as fs from 'fs';
import Handlebars from 'handlebars';
import publicRoutes from './publicRoutes';

let pageNotFoundTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../../templates/404.hbs').toString('utf-8'))

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
},  console, document, window, document.getElementById('main-content'), pageNotFoundTemplate);

client.pjax.registerAdditionalElement(document.getElementById('root-link'));

client.attachRouter();

let loginTemplate = fs.readFileSync(__dirname + '/../../templates/loginUrl.hbs').toString('utf-8');
let profileTemplate = fs.readFileSync(__dirname + '/../../templates/profile.hbs').toString('utf-8');

client.addRoutes(publicUserRoutes(Handlebars.compile(profileTemplate), Handlebars.compile(loginTemplate)));
client.addRoutes(publicRoutes);