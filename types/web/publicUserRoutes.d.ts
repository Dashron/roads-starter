import SimpleRouter from "roads/types/middleware/simpleRouter";
export interface PublicUserRoutesConfig {
    cognitoUrl: string;
    cognitoRedirectUri: string;
    cognitoClientId: string;
}
declare const _default: (profilePage: Function, loginPage: Function) => (router: SimpleRouter, config: PublicUserRoutesConfig) => void;
export default _default;
