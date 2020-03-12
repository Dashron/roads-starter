"use strict";

export { default as APIProject } from './api/apiProject';
export { default as PrivateWebProject } from './web/privateWebProject';
export { default as ClientProject } from './web/clientProject';
export { default as config } from './config';
export { default as formValidation } from './web/formValidation';

/*export { default as Resource } from './Resource/resource';
export { default as Resource } from './Resource/resource';
export { default as Resource } from './Resource/resource';

module.exports.PrivateWebProject = require('./src/web/privateWebProject.js.js');
module.exports.ClientProject = require('./src/web/clientProject.js.js');
module.exports.config = require('./config.js/index.js');
module.exports.formValidation = require('./src/web/formValidation.js.js');*/

export interface Logger {
    warn: (param: any) => void,
    info: (param: any) => void,
    error: (err: Error) => void
};