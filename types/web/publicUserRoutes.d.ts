import SimpleRouter from "roads/types/middleware/simpleRouter";
import { Logger } from "../index";
export interface PublicUserRoutesConfig {
    cognitoUrl: string;
    cognitoRedirectUri: string;
    cognitoClientId: string;
}
declare const _default: (profilePage: Function, loginPage: Function) => (router: SimpleRouter, config: PublicUserRoutesConfig, logger: Logger) => void;
export default _default;
