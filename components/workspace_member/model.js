const { Model, DataTypes, Deferrable } = require('sequelize');
// const slugify = require('slugify');

class WorkspaceMember extends Model {}

module.exports = (sequelize) => {
    WorkspaceMember.init(
        {
            // Model attributes are defined here
            workspaceId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'workspaces',
                    key: 'id',
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
                }
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
                }
            },
            admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            invitationStatus: {
                type: DataTypes.STRING,
                defaultValue: 'pending'
            }
        },
        {
            sequelize,
            modelName: 'workspaceMember',
            updatedAt: false,
            // composite key
            indexes: [{ fields: ['workspaceId', 'userId'], unique: true }]
        }
    );

    // WorkspaceMember.associate = (models) => {
    //     // 1:M
    //     WorkspaceMember.belongsTo(models.Workspace, {
    //         foreignKey: 'workspaceId'
    //         // { name: 'teamId', field: 'team_id' }
    //     });
    //     WorkspaceMember.belongsTo(models.User, {
    //         foreignKey: 'userId'
    //     });
    // };

    return WorkspaceMember;
};
