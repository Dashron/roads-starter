import { ParsedURLParams, ActionList } from "roads-api/types/Resource/resource";
import { Resource } from 'roads-api';
import { Sequelize } from "sequelize/types";
import { Logger } from "../../";
export default class UserResource extends Resource {
    protected dbConnection: Sequelize;
    constructor(dbConnection: Sequelize, logger: Logger, tokenResolver: Function, cognitoUrl: string, cognitoPort: number);
    modelsResolver(urlParams: ParsedURLParams, searchParams: URLSearchParams | undefined, action: keyof ActionList, pathname: string): Promise<import("sequelize/types").Model<unknown, unknown>>;
}
