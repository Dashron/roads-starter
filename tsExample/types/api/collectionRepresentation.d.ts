declare const JSONRepresentation: any;
export default function (itemRepresentation: typeof JSONRepresentation, resolveArrayItems: Function): {
    new (): {
        [x: string]: any;
    };
    [x: string]: any;
};
export {};
