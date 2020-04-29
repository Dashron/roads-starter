import * as jsonPointer from 'json-pointer';
import { FieldErrorPayload } from 'roads-api/types/Representation/validationError';

export function problemsToFormdata(fieldPaths: Array<string>, requestBody: any, problems: Array<FieldErrorPayload>) {
    let formData: {[x: string]: {
        invalid: boolean,
        value: any,
        problems: Array<string>
    }} = {};

    fieldPaths.forEach((path) => {
       formData[path] = {
           invalid: false,
           value: requestBody ? jsonPointer.get(requestBody, path) : '',
           problems: []
       }
    });

    if (problems) {
        problems.forEach((problem) => {
            if (problem.field) {
                formData[problem.field].invalid = true;
                
                if (!formData[problem.field].problems) {
                    formData[problem.field].problems = [];
                }

                formData[problem.field].problems.push(problem.title);
            }
        });
    }

    return formData;
}

export function valOrUndefined (value: string) {
    return value === '' ? undefined : value;
}