import { Middleware } from "roads/types/core/road";
import { Logger } from "../../index";

var jwt = require('jsonwebtoken');

let privateAuth = (authCookieName: string, logger: Logger, secret: string): Middleware => {
    return function (method, path, body, headers, next) {
        this.loggedIn = false;
        
        if (this.cookies[authCookieName]) {
            try {
                let decoded = jwt.verify(this.cookies[authCookieName], secret, {
                    algorithms: ['HS256']
                });

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

export default privateAuth;