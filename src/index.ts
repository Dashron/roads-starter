"use strict";

export { default as APIProject } from './api/apiProject';
export { default as PrivateWebProject } from './web/privateWebProject';
export { default as config } from './config';
export { default as formValidation } from './web/formValidation';

// I don't like this...
export interface Logger {
    warn: (param: any) => void,
    info: (param: any) => void,
    error: (err: Error) => void
};