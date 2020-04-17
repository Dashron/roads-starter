import { Middleware } from "roads/types/core/road";
import { CookieResponse } from "roads/types/middleware/cookie";

// https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
var rand = function() {
    return Math.random().toString(36).substr(2);
};

// https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
var createToken = function() {
    return rand() + rand() + rand() + rand();
};

let csrfServer = (cookieName: string): Middleware => {
    return function (method, path, body, headers, next) {

        this.setNewCsrfToken = () => {
            this.csrfToken = createToken();
            let response = new this.Response('') as CookieResponse;
            response.setCookie(cookieName, this.csrfToken);
            return response;
        };

        this.checkCsrfToken = (providedToken: string) => {
            // If we couldn't find the configured cookie, or any cookies at all, return false. This is to protect against any weird bugs causing a false equivilancy (e.g. providedToken and cookie are both false)
            if (!this.cookies || !this.cookies[cookieName]) {
                return false;
            }

            return this.cookies[cookieName] === providedToken;
        };

        return next();
    };
};

export default csrfServer;