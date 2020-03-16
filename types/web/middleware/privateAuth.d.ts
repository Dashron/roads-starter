import { Middleware } from "roads/types/core/road";
import { Logger } from "../../index";
declare let privateAuth: (authCookieName: string, logger: Logger, secret: string) => Middleware;
export default privateAuth;
