import { Middleware } from "roads/types/core/road";
declare let csrfServer: (cookieName: string) => Middleware;
export default csrfServer;
