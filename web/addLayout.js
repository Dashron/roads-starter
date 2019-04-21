"use strict";
/**
 * addLayout.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 */

let Roads = require('roads');

module.exports = function (wrapLayout, pageNotFound) {
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
    return function (method, url, body, headers, next) {
        return next()
            .then((response) => {
                if (!response) {
                    let msg = 'Page not found';
                    let err = new Roads.HttpError(msg, Roads.HttpError.not_found);
                    
                    if (this.ignore_layout) {
                        err.htmlMessage = msg;
                    } else {
                        err.htmlMessage = pageNotFound();
                    }
                    throw err;
                }

                if (!this.ignore_layout) {
                    response.body = wrapLayout(response.body, this._page_title ? this._page_title : '');
                }

                return response;
            });
    };
}