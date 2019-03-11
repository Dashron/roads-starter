"use strict";
/**
 * applyPublicRoutes.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 */

const Handlebars = require('handlebars');
let moment = require('moment');
let Remarkable = require('remarkable');
let md = new Remarkable({
    breaks: true,
    linkify: true
});

var jwt = require('jsonwebtoken');

let randomTableTemplate = require('fs').readFileSync(__dirname + '/static/templates/randomTable.hbs').toString('utf-8');

 /**
  * 
  * @param {SimpleRouter} router - The router that the routes will be added to
  */
module.exports = function (router) {
	router.addRoute('GET', '/', async function (url, body, headers) {
        this.setTitle('DMDashboard.com');
    
        /*let timelineListItems = await this.api('GET', '/timeline');*/
        let showLogin = (url.query && url.query.showLogin === 'true');

        let randomTable = Handlebars.compile(randomTableTemplate);

		let responseBody = randomTable({            
            loggedIn: this.loggedIn,
            showLogin: showLogin,
            items: [{
                roll: 1,
                value: "Human"
            }, {
                roll: 2,
                value: "Dwarf"
            }, {
                roll: 3,
                value: "Half Elf"
            }]
        });

		return new this.Response(responseBody, 200, {'content-type': 'text/html'});
    });
};