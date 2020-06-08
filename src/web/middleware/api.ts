import { Middleware } from "roads/types/core/road";
import { Request } from 'roads';

export default (secure: boolean, hostname: string, port: number): Middleware => {
    return function (method, path, body, headers, next) {
        // Add an "api" function to the request context that makes HTTP requests to the API
        let apiClient = new Request(secure, hostname, port);
        this.api = (method: string, path: string, body?: string, headers?: {[x: string]: string}) => {
            if (this.isLoggedIn()) {
                if (!headers) {
                    headers = {};
                }

                headers.authorization = "Bearer " + this.authToken;
            }
            
            return apiClient.request(method, path, body, headers);
        };

        return next();
    }
}