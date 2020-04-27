import { User } from "./userModel";
import { ParsedURLParams, ActionList } from "roads-api/types/Resource/resource";
import { Sequelize } from "sequelize/types";
import { Logger } from "../../";
import { APIProjectConfig } from "../apiProject";
import StarterResource from "../starterResource";
export default class UserResource extends StarterResource {
    constructor(dbConnection: Sequelize, logger: Logger, tokenResolver: Function, config: APIProjectConfig);
    modelsResolver(urlParams: ParsedURLParams, searchParams: URLSearchParams | undefined, action: keyof ActionList, pathname: string): Promise<User>;
}
