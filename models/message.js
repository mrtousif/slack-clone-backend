const { Model, DataTypes, Sequelize } = require('sequelize');

class Message extends Model {}

module.exports = (sequelize) => {
    Message.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            text: {
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            modelName: 'message'
        }
    );

    Message.associate = (models) => {
        Message.belongsTo(models.Channel, {
            foreignKey: 'channelId'
            // { name: 'channelId', field: 'channel_id' }
        });

        Message.belongsTo(models.User, {
            foreignKey: 'userId'
            // { name: 'userId', field: 'user_id' }
        });
    };

    return Message;
};
