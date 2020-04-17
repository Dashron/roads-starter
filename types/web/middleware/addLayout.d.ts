/**
 * addLayout.js
 * Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
 * MIT Licensed
 *
 */
import { Context, Middleware } from 'roads/types/core/road';
export declare type LayoutWrapper = (body: string, title: string, context: Context) => string;
export default function (layoutWrapper: LayoutWrapper): Middleware;
