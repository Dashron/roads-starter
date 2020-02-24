import jwkToPem from 'jwk-to-pem';
export declare type PrivateUserRoutesConfig = {
    cognitoJwks: {
        keys: Array<jwkToPem.JWK>;
    };
    cognitoUrl: string;
    cognitoClientId: string;
    cognitoRedirectUri: string;
    cognitoClientSecret: string;
    secret: string;
    authCookieName: string;
    secure: string;
    hostname: string;
};
export declare type JWTUser = {};
declare const _default: (router: any, config: PrivateUserRoutesConfig, logger: any) => void;
export default _default;
