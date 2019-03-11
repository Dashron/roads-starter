"use strict";
/**
 * addLayout.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 */

const Handlebars = require('handlebars');
let layoutTemplate = require('fs').readFileSync(__dirname + '/static/templates/layout.hbs').toString('utf-8');
let pageNotFoundTemplate = require('fs').readFileSync(__dirname + '/static/templates/404.hbs').toString('utf-8');
let Roads = require('roads');

 /**
  * 
  * @param {string} body - The custom HTML to be rendered within the layout
  * @param {string} title - The page title
  * @param {boolean} ignore_layout - If true, the layout is not used, and we return the body as is
  */
function wrapLayout(body, title, ignore_layout) {
	if (ignore_layout) {
		return body;
	}
    
    let template = Handlebars.compile(layoutTemplate);

    return template({
        title: title,
        body: body
    });
}

let pageNotFound = (() => {
    let template = Handlebars.compile(pageNotFoundTemplate);
    return template();
})();

/**
 * This middleware wraps the response in a standard HTML layout. It looks for three fields in the request context.
 * - _page_title - The title of the page
 * - ignore_layout - If true, this middleware will not apply the layout (useful for JSON responses)
 * 
 * @param {string} method - HTTP request method
 * @param {string} url - HTTP request url
 * @param {string} body - HTTP request body
 * @param {object} headers - HTTP request headers
 * @param {function} next - When called, this function will execute the next step in the roads method chain
 */
module.exports = function (method, url, body, headers, next) {
	return next()
		.then((response) => {
            if (!response) {
                let err = new Roads.HttpError('Page not found', Roads.HttpError.not_found);
                err.htmlMessage = wrapLayout(pageNotFound, 'Page not found', false);
                throw err;
            }

			response.body = wrapLayout(response.body, this._page_title ? this._page_title : '', this.ignore_layout ? true : false);
			return response;
		});
};