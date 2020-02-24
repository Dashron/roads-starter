import { User } from "./userModel";
import { WritableRepresentation } from "roads-api/types/Representation/representation";
import { ParsedURLParams, ActionList } from "roads-api/types/Resource/resource";
import { Resource } from 'roads-api';
export declare class UserResource extends Resource {
    constructor();
    modelsResolver(urlParams: ParsedURLParams, searchParams: URLSearchParams | undefined, action: keyof ActionList, pathname: string): Promise<any>;
    get(models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User): void;
    partialEdit(models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User): any;
    fullReplace(models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User): Promise<any>;
    delete(models: User, requestBody: any, requestMediaHandler: WritableRepresentation, auth: User): any;
}
