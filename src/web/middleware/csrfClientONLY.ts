import { Middleware } from "roads/types/core/road";

// CSRF isn't an issue in client side JS, so this fakes some of the CSRF tokens in the client.
// NEVER USE THIS SERVER SIDE

let csrfClientOnly: Middleware = function (method, path, body, headers, next) {
    this.setNewCsrfToken = () => {
        return new this.Response('');
    };

    this.checkCsrfToken = (providedToken: string) => {
        return true;
    };

    return next();
};

export default csrfClientOnly;