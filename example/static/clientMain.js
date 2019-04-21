"use strict";
/**
 * client.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 * This file is an example of using roads router in the client
 */

var roads = require('../../index.js');
var road = new roads.Road();

var pjax = new roads.PJAX(road, document.getElementById('container'), window);
pjax.addTitleMiddleware();
pjax.addCookieMiddleware(document);
pjax.register();
// this is wrong for the new setup let router = new roads.middleware.SimpleRouter(road);
// this wont work require('../routes/applyPublicRoutes.js')(router);