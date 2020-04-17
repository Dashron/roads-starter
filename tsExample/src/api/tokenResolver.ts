import * as jwt from 'jsonwebtoken';
import { Logger } from 'roads-starter';
import { Sequelize } from 'sequelize/types';
import { TokenResolver, APIProjectConfig } from 'roads-starter/types/api/apiProject';

export default (sequelize: Sequelize, logger: Logger, config: APIProjectConfig ): TokenResolver => {
    return async function (token: string): Promise<any> {
        try {
            let decoded = jwt.verify(token, config.secret, {
                algorithms: ['HS256']
            });

            if (decoded && typeof decoded === "object") {
                let user = await sequelize.models.User.findOne({
                    where: {
                        // todo: I don't like this, but jwt's types return object instead of something more strict
                        // @ts-ignore Property 'val' does not exist on type 'object'.ts(2339
                        remoteId: decoded.val
                    }
                });

                if (user) {
                    return user;
                }

                return false;
            }
        } catch (e) {
            return false;
        }
    };
};