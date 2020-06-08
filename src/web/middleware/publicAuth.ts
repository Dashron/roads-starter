import { Logger } from "../../index";
import { Middleware } from "roads/types/core/road";

var jwt = require('jsonwebtoken');

let publicAuth = (authCookieName: string, logger: Logger): Middleware => {
    return function (method, path, body, headers, next) {
        if (this.cookies[authCookieName]) {
            try {
                let decoded = jwt.decode(this.cookies[authCookieName]);
                
                if (decoded) {
                    this.authToken = this.cookies[authCookieName];
                    this.authDecoded = decoded;
                }
            } catch (e) {
                logger.error(e);
            }
        }

        this.isLoggedIn = (loggedInUserIdCheck?: number) => {
            if (this.authDecoded) {

                if (loggedInUserIdCheck === undefined) {
                    return true;
                }
    
                if (loggedInUserIdCheck == this.authDecoded.uid) {
                    return true;
                }
            }
    
            return false;
        };

        return next();
    };
};

export default publicAuth;