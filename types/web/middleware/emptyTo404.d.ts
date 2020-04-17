import { Middleware } from "roads/types/core/road";
/**
 * emptyTo404.js
 * Copyright(c) 2019 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 * This file is an example of how to apply HTML layouts via a middleware system
 */
/**
 * This middleware translates missing responses into 404s
 *
 * @param {string} method - HTTP request method
 * @param {string} url - HTTP request url
 * @param {string} body - HTTP request body
 * @param {object} headers - HTTP request headers
 * @param {function} next - When called, this function will execute the next step in the roads method chain
 */
declare let emptyTo404: (pageNotFoundTemplate: () => string) => Middleware;
export default emptyTo404;
