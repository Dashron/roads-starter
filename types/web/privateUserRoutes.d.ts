import jwkToPem from 'jwk-to-pem';
import SimpleRouter from 'roads/types/middleware/simpleRouter';
import { Logger } from '../index';
export interface PrivateUserRoutesConfig {
    cognitoJwks: {
        keys: Array<KIDJWK>;
    };
    cognitoUrl: string;
    cognitoClientId: string;
    cognitoRedirectUri: string;
    cognitoClientSecret: string;
    secret: string;
    authCookieName: string;
    secure: boolean;
    hostname: string;
}
export interface JWTUser {
    sub: string;
}
export interface KIDJWK extends jwkToPem.EC {
    kid: string;
}
declare const _default: (router: SimpleRouter, config: PrivateUserRoutesConfig, logger: Logger) => void;
export default _default;
