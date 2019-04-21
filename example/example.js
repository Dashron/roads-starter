let roadsStarter = require('../index.js');
let config = require('./config/config.json');
const Handlebars = require('handlebars');
let fs = require('fs');

// TODO: Maybe all projects should have an init call that sets up router and roads and stuff, like public web. this allows for consistency, and likely better testing too
let api = new roadsStarter.APIProject(config.api);
api.addRoadsUserEndpoints();
api.start();

/*
 * LAYOUT
 */ 
let layoutTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/templates/layout.hbs').toString('utf-8'));
let pageNotFoundTemplate = Handlebars.compile(fs.readFileSync(__dirname + '/templates/404.hbs').toString('utf-8'));

let layout = (body, title) => {
    return layoutTemplate({
        title: title,
        body: body,
        config: config.web.layoutConstants
    });
};

/*
 * PROJECT
 */
let privateWeb = new roadsStarter.PrivateWebProject(config.web, layout, () => {
    return layout(pageNotFoundTemplate(), 'Page not found');
});

/*
 * BASIC ROUTES
 */
privateWeb.addRoadsUserFunctionality();
privateWeb.addStaticFolder('/static/', __dirname + '/static/js', 'application/json');
privateWeb.addStaticFolder('/static/', __dirname + '/static/css', 'text/css');

/*
 * ROOT ROUTE
 */
let indexTemplate = require('fs').readFileSync(__dirname + '/templates/index.html').toString('utf-8');
privateWeb.getRouter().addRoute('GET', '/', function (url, body, headers) {
    let indexPage = Handlebars.compile(indexTemplate);
    return new this.Response(indexPage(), 200, {'content-type': 'text/html'});
});

/*
 * LOGIN ROUTE
 */
let loginTemplate = require('fs').readFileSync(__dirname + '/templates/loginUrl.hbs').toString('utf-8');
privateWeb.getRouter().addRoute('GET', '/login', function (url, body, headers) {
    let loginPage = Handlebars.compile(loginTemplate);
    let responseBody = loginPage({
        //redirectUrl: (config.web.secure ? 'https':'http') + '://localhost:8080/login/redirect',
        // todo: use the proper hostname so cookies work
        redirectUrl: (config.web.secure ? 'https':'http') + '://' + config.web.hostname + (config.web.port ? ':' + config.web.port : '') + '/login/redirect',
        clientId: config.web.cognitoClientId
    });

    return new this.Response(responseBody, 200, {'content-type': 'text/html'});
});

/*
 * START PROJECT
 */
privateWeb.start();

/*
let publicWeb = new roadsStarter.PublicWebProject(privateWeb.getRoad(), privateWeb.getRouter(), {});
// build the public web server and routes
// tie the build public js to the private file server
publicWeb.start();
*/