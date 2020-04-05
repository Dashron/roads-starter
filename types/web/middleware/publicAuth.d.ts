import { Logger } from "../../index";
import { Middleware } from "roads/types/core/road";
declare let publicAuth: (authCookieName: string, logger: Logger) => Middleware;
export default publicAuth;
