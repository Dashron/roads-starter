import { FieldErrorPayload } from 'roads-api/types/Representation/validationError';
export declare function problemsToFormdata(fieldPaths: Array<string>, requestBody: any, problems: Array<FieldErrorPayload>): {
    [x: string]: {
        invalid: boolean;
        value: any;
        problems: Array<string>;
    };
};
export declare function valOrUndefined(value: string): string | undefined;
