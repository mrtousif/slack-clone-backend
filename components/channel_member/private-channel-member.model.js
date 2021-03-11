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
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
                }
            },
            admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'privateChannelMember',
            updatedAt: false
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
