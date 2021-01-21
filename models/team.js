const { DataTypes, Model, Sequelize, Deferrable } = require('sequelize');

class Team extends Model {}

module.exports = (sequelize) => {
    Team.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                unique: true
            },
            owner: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    // This is a reference to another model
                    model: 'users',
                    // This is the column name of the referenced model
                    key: 'id',
                    // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
                    // Options:
                    // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
                    // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
                    // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
                }
            }
        },
        {
            sequelize,
            modelName: 'team'
        }
    );

    // Team.beforeSave((user, opts) => {
    //     user.slug =
    // });

    Team.associate = (models) => {
        Team.belongsToMany(models.User, {
            through: 'member',
            foreignKey: 'teamId'
            // { name: 'teamId', field: 'team_id' }
        });

        Team.belongsTo(models.User, {
            foreignKey: 'owner'
        });
    };

    return Team;
};
