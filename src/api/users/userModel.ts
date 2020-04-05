import { Sequelize, Model, DataTypes as DataTypesModule } from 'sequelize';
export class User extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public accessToken!: string;
    public remoteId!: string;
    public refreshToken!: string;
    public expiresIn!: number;
    public active!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
};

export default (sequelize: Sequelize, DataTypes: typeof DataTypesModule) => {
    // Example TS models: https://sequelize.org/master/manual/typescript.html
    User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey : true,
            autoIncrement : true
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        remoteId: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        expiresIn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'users',
        sequelize: sequelize, // this bit is important
    });
};