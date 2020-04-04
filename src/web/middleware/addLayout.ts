/**
 * addLayout.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 * 
 */

import { Context, Middleware } from 'roads/types/core/road';

export type LayoutWrapper = (body: string, title: string, context: Context) => string;

export default function (layoutWrapper: LayoutWrapper): Middleware {
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
                if (!this.ignore_layout) {
                    response.body = layoutWrapper(response.body, this._page_title ? this._page_title : '', this);
                }

                return response;
            });
    };
}