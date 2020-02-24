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

/*
async function stuff() {
  // Please note that when using async/await you lose the `bluebird` promise context
  // and you fall back to native
  const newUser = await User.create({
    name: 'Johnny',
    preferredName: 'John',
  });
  console.log(newUser.id, newUser.name, newUser.preferredName);

  const project = await newUser.createProject({
    name: 'first!',
  });

  const ourUser = await User.findByPk(1, {
    include: [User.associations.projects],
    rejectOnEmpty: true, // Specifying true here removes `null` from the return type!
  });
  console.log(ourUser.projects![0].name); // Note the `!` null assertion since TS can't know if we included
                                          // the model or not
}*/