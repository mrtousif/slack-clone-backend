const { Model, DataTypes, Sequelize } = require('sequelize');
// const slugify = require('slugify');

class Message extends Model {}

module.exports = (sequelize) => {
    Message.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            channelId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            fileName: {
                type: DataTypes.STRING
            },
            fileType: {
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            modelName: 'message',
            updatedAt: false
            // indexes: [{ fields: ['workspaceId', 'name'], unique: true }]
        }
    );

    // Message.beforeValidate((user, options) => {});

    Message.associate = (models) => {
        // 1:M
        Message.belongsTo(models.Channel, {
            foreignKey: 'channelId'
            // {
            //     name: 'channelId',
            //     field: 'channel_id'
            // }
        });

        Message.belongsTo(models.User, {
            foreignKey: 'userId'
        });
    };

    return Message;
};
