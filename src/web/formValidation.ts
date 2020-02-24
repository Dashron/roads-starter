import jsonPointer from 'json-pointer';
import { InputValidationError } from 'roads-api/types/core/httpErrors';

module.exports.problemsToFormdata = (fieldPaths: Array<string>, requestBody: any, problems: Array<InputValidationError>) => {
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
            formData[problem.field].invalid = true;
            
            if (!formData[problem.field].problems) {
                formData[problem.field].problems = [];
            }

            formData[problem.field].problems.push(problem.title);
        });
    }

    return formData;
}

module.exports.valOrUndefined = (value: string) => {
    return value === '' ? undefined : value;
}

// https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
/*module.exports.handlebarsIfEq = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
}*/