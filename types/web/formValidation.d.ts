import { InputValidationError } from 'roads-api/types/core/httpErrors';
export declare function problemsToFormdata(fieldPaths: Array<string>, requestBody: any, problems: Array<InputValidationError>): {
    [x: string]: {
        invalid: boolean;
        value: any;
        problems: string[];
    };
};
export declare function valOrUndefined(value: string): string | undefined;
