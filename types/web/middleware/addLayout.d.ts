/**
 * addLayout.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 */
import { Context, Middleware } from 'roads/types/core/road';
export default function (wrapLayout: (body: string, title: string, context: Context) => string): Middleware;
