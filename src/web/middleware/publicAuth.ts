import { Logger } from "../../index";
import { Middleware } from "roads/types/core/road";

var jwt = require('jsonwebtoken');

let publicAuth = (authCookieName: string, logger: Logger): Middleware => {
    return function (method, path, body, headers, next) {
        this.loggedIn = false;
    
        if (this.cookies[authCookieName]) {
            try {
                let decoded = jwt.decode(this.cookies[authCookieName]);
                
                if (decoded) {
                    this.loggedIn = true;
                    this.authToken = this.cookies[authCookieName];
                    this.authDecoded = decoded;
                }
            } catch (e) {
                logger.error(e);
            }
        }

        return next();
    };
};

export default publicAuth;