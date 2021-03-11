const { DataTypes, Model, Sequelize } = require('sequelize');
const slugify = require('slugify');

class Workspace extends Model {}

module.exports = (sequelize) => {
    Workspace.init(
        {
            // Model attributes are defined here
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            owner: {
                type: DataTypes.UUID,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'workspace',
            updatedAt: false
        }
    );

    Workspace.beforeValidate((workspace) => {
        workspace.slug = slugify(workspace.name, {
            replacement: '-', // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true, // convert to lower case, defaults to `false`
            strict: true // strip special characters except replacement, defaults to `false`
            // locale: 'vi'       // language code of the locale to use
        });
    });

    Workspace.associate = (models) => {
        Workspace.belongsToMany(models.User, {
            through: models.WorkspaceMember,
            foreignKey: 'workspaceId'
            // { name: 'workspaceId', field: 'workspace_id' }
        });

        Workspace.belongsTo(models.User, {
            foreignKey: 'owner'
        });
    };

    return Workspace;
};
