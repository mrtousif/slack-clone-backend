const { ValidationError } = require('apollo-server-express');

const {
    models: { Channel }
} = require('../index');

exports.createChannel = async (args, transaction) => {
    const { name, workspaceId, owner, private } = args;
    console.log(workspaceId, name);
    let channel = await Channel.findOne({
        where: { workspaceId, name }
    });
    console.log(channel);
    if (channel) {
        throw new ValidationError('Channel name already exist');
    }

    channel = await Channel.create(
        {
            name,
            workspaceId,
            owner,
            private
        },
        { transaction }
    );

    return channel;
};
