import { Sequelize, Model, DataTypes as DataTypesModule } from 'sequelize';
export declare class User extends Model {
    id: number;
    accessToken: string;
    remoteId: string;
    refreshToken: string;
    expiresIn: number;
    active: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
declare const _default: (sequelize: Sequelize, DataTypes: typeof DataTypesModule) => void;
export default _default;
