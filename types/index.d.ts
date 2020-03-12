export { default as APIProject } from './api/apiProject';
export { default as PrivateWebProject } from './web/privateWebProject';
export { default as ClientProject } from './web/clientProject';
export { default as config } from './config';
export { default as formValidation } from './web/formValidation';
export interface Logger {
    warn: (param: any) => void;
    info: (param: any) => void;
    error: (err: Error) => void;
}
