const { ValidationError } = require('apollo-server-express');

const {
    models: { Workspace }
} = require('../index');

exports.createWorkspace = async (data, options = {}) => {
    const { name, owner } = data;

    let workspace = await Workspace.findOne({
        where: { name }
    });
    // console.log(Workspace);
    if (workspace) {
        throw new ValidationError(`Workspace name ${name} already exist`);
    }

    workspace = await Workspace.create({ name, owner }, options);

    return workspace;
};

exports.getWorkspaceById = async (id) => {
    const workspace = await Workspace.findByPk(id);
    if (!workspace) {
        throw new ValidationError('Invalid Id. Workspace does not exist');
    }

    return workspace;
};
