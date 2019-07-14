"use strict";

let jsonPointer = require('json-pointer');

module.exports.problemsToFormdata = (fieldPaths, requestBody, problems) => {
    let formData = {};

    fieldPaths.forEach((path) => {
       formData[path] = {
           invalid: false,
           value: requestBody ? jsonPointer.get(requestBody, path) : ''
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

module.exports.valOrUndefined = (value) => {
    return value === '' ? undefined : value;
}

// https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
/*module.exports.handlebarsIfEq = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
}*/