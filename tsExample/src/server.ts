import { config as configModule, APIProject, PrivateWebProject } from 'roads-starter';
import { createLogger } from './logger';
import tokenResolver from './api/tokenResolver';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import { Context } from 'roads/types/core/road';

let publicUserRoutes = require('roads-starter/web/publicUserRoutes');
let privateUserRoutes = require('roads-starter/web/privateUserRoutes');
import publicRoutes from './web/publicRoutes';
import privateRoutes from './web/privateRoutes';


const ENVIRONMENT = process.env.ROADS_ENV || 'default';
let config = configModule(__dirname + '/../config', ENVIRONMENT);
let apiLogger = createLogger('api-server');
let webLogger = createLogger('web-server');

if (process.argv.length < 3 || process.argv[2] === "api") {
    apiLogger.info('starting api server');
    let api = new APIProject(config.api, apiLogger);
    
    api.addTokenResolver(tokenResolver);
    api.addRoadsUserEndpoints();
    api.start();
}

if (process.argv.length < 3 || process.argv[2] === "web") {
    webLogger.info('starting web server');
    /*
    * LAYOUT
    */ 
    let layoutTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../templates/layout.hbs').toString('utf-8'));
    let pageNotFoundTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../templates/404.hbs').toString('utf-8'));

    let layout = (body: string, title: string, context: Context) => {
        return layoutTemplate({
            title: title,
            body: body,
            config: config.web.layoutConstants,
            loggedIn: context ? context.loggedIn : false
        });
    };

    /*
    * PROJECT
    */
    let privateWeb = new PrivateWebProject(config.web, webLogger, layout, pageNotFoundTemplate as () => string/*handlebars template delegate is essentially this. todo: there's probably a better way to handle this*/);
    
    if (ENVIRONMENT != "docker") {
        // docker sends these through nginx
        privateWeb.addStaticFolder('/static/js', __dirname + '/../static/js', 'application/javascript');
        privateWeb.addStaticFolder('/static/css', __dirname + '/../static/css', 'text/css');
    }

    let profileTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../templates/profile.hbs').toString('utf-8'));
    let loginUrlTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/../templates/loginUrl.hbs').toString('utf-8'));

    // I hate having to use "default" here, it can only be avoided by changing the module type, or accessing it from another file. I also don't like the lack of typing.
    privateWeb.addRoutes(publicUserRoutes.default(profileTemplate,loginUrlTemplate));
    privateWeb.addRoutes(privateUserRoutes.default);
    privateWeb.addRoutes(publicRoutes);
    privateWeb.addRoutes(privateRoutes);

    /*
    * START PROJECT
    */
    privateWeb.start();
}