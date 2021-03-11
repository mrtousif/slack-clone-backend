const { Model, DataTypes, Sequelize, Deferrable } = require('sequelize');
// const slugify = require('slugify');

class ChannelMember extends Model {}

module.exports = (sequelize) => {
    ChannelMember.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            channelId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'channels',
                    key: 'id',
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
                }
            },
            userId: {
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
            },
            admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'channelMember',
            updatedAt: false,
            indexes: [{ fields: ['channelId', 'userId'], unique: true }]
        }
    );

    // Channel.beforeValidate((user, opts) => {
    //     user.name = slugify(user.name, {
    //         replacement: '-', // replace spaces with replacement character, defaults to `-`
    //         remove: undefined, // remove characters that match regex, defaults to `undefined`
    //         lower: true, // convert to lower case, defaults to `false`
    //         strict: true // strip special characters except replacement, defaults to `false`
    //         // locale: 'vi'       // language code of the locale to use
    //     });
    // });

    // ChannelMember.associate = (models) => {
    //     // 1:M
    //     ChannelMember.belongsTo(models.Channel, {
    //         foreignKey: 'channelId'
    //         // { name: 'teamId', field: 'team_id' }
    //     });

    //     // N:M
    //     ChannelMember.belongsTo(models.User, {
    //         foreignKey: 'userId'
    //     });
    // };

    return ChannelMember;
};
