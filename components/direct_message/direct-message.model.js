const { Model, DataTypes, Sequelize } = require('sequelize');
// const slugify = require('slugify');

class DirectMessage extends Model {}

module.exports = (sequelize) => {
    DirectMessage.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            receiverId: {
                type: DataTypes.UUID
            },
            senderId: {
                type: DataTypes.UUID
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            workspaceId: {
                type: DataTypes.UUID
            }
        },
        {
            sequelize,
            modelName: 'directMessage',
            updatedAt: false
            // indexes: [{ fields: ['workspaceId', 'name'], unique: true }]
        }
    );

    // DirectMessage.beforeValidate((user, options) => {});

    DirectMessage.associate = (models) => {
        // 1:M
        DirectMessage.belongsTo(models.User, {
            foreignKey: 'receiverId'
        });

        DirectMessage.belongsTo(models.User, {
            foreignKey: 'senderId'
        });

        DirectMessage.belongsTo(models.Workspace, {
            foreignKey: 'workspaceId'
        });
    };

    return DirectMessage;
};
