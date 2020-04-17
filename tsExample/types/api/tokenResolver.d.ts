import { Logger } from 'roads-starter';
import { Sequelize } from 'sequelize/types';
import { TokenResolver, APIProjectConfig } from 'roads-starter/types/api/apiProject';
declare const _default: (sequelize: Sequelize, logger: Logger, config: APIProjectConfig) => TokenResolver;
export default _default;
