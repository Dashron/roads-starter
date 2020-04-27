import { Resource } from "roads-api";
import { Sequelize } from "sequelize/types";
import { Logger } from "../index";
import { APIProjectConfig } from "./apiProject";
export declare type StarterResourceConstructor = {
    new (dbConnection: Sequelize, logger: Logger, tokenResolver: Function, config: APIProjectConfig): StarterResource;
};
export default abstract class StarterResource extends Resource {
    protected dbConnection: Sequelize;
    protected logger: Logger;
    protected tokenResolver: Function;
    protected config: APIProjectConfig;
    constructor(dbConnection: Sequelize, logger: Logger, tokenResolver: Function, config: APIProjectConfig);
}
