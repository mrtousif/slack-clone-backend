const { Model, DataTypes, Sequelize, Deferrable } = require('sequelize');
const slugify = require('slugify');

class Channel extends Model {}

module.exports = (sequelize) => {
    Channel.init(
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
            private: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
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
            modelName: 'channel'
        }
    );

    Channel.beforeValidate((user, options) => {
        user.name = slugify(user.name, {
            replacement: '-', // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true, // convert to lower case, defaults to `false`
            strict: true // strip special characters except replacement, defaults to `false`
            // locale: 'vi'       // language code of the locale to use
        });
    });

    // Channel.associate = (models) => {
    //     // 1:M
    //     Channel.belongsTo(models.Team, {
    //         foreignKey: 'teamId'
    //         // { name: 'teamId', field: 'team_id' }
    //     });

    //     // N:M
    //     Channel.belongsToMany(models.User, {
    //         through: 'channelMember',
    //         foreignKey: 'channelId'
    //         // {
    //         //     name: 'channelId',
    //         //     field: 'channel_id'
    //         // }
    //     });
    // };

    return Channel;
};
