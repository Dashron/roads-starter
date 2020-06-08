import { Middleware } from "roads/types/core/road";
import { Logger } from "../../index";

var jwt = require('jsonwebtoken');

let privateAuth = (authCookieName: string, logger: Logger, secret: string): Middleware => {
    return function (method, path, body, headers, next) {
        if (this.cookies[authCookieName]) {
            try {
                // decode it and use the secret to ensure it's signed properly
                let decoded = jwt.verify(this.cookies[authCookieName], secret, {
                    algorithms: ['HS256']
                });

                if (decoded && decoded.val) {
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

export default privateAuth;