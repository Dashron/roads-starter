"use strict";

const JSONRepresentation = require('roads-api').JSONRepresentation;

export default function (itemRepresentation: typeof JSONRepresentation, resolveArrayItems: Function) {
    return class CollectionRepresentation extends JSONRepresentation {
        constructor () {
            super({
                "type": "object",
                "properties": {
                    "data": {
                        "type": "array",
                        "items": itemRepresentation.getSchema(),
                        "resolveArrayItems": resolveArrayItems
                    },
                    "perPage": {
                        "type": "number",
                        "resolve": (models: {perPage: number}) => {
                            return models.perPage;
                        }
                    },
                    "page": {
                        "type": "number",
                        "resolve": (models: {page: number}) => {
                            return models.page;
                        }
                    }
                },
                "additionalProperties": false
            });
        }
    };
};
