import { Middleware } from "roads/types/core/road";
import { Logger } from "../../index";
declare let publicAuth: (authCookieName: string, logger: Logger) => Middleware;
export default publicAuth;
