export { default as APIProject } from './api/apiProject';
export { default as StarterResource } from './api/starterResource';
export { default as PrivateWebProject } from './web/privateWebProject';
export { default as config } from './config';
export { problemsToFormdata as formValidation } from './web/formValidation';
export { default as publicUserRoutes } from './web/publicUserRoutes';
export { default as privateUserRoutes } from './web/privateUserRoutes';
export interface Logger {
    log: (data: any) => any;
    warn: (warning: any) => any;
    info: (details: any) => any;
    error: (err: Error) => any;
}
