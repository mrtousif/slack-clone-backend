const {
    AuthenticationError,
    ForbiddenError,
    ValidationError
} = require('apollo-server-express');

exports.authenticate = (resolver) => {
    return (root, args, context, info) => {
        if (context.isAuthenticated) {
            return resolver(root, args, context, info);
        }

        throw new AuthenticationError(`Not authenticated. Please login`);
    };
};

exports.checkWorkspaceMember = (resolver) => {
    return async (root, args, context, info) => {
        const { channelId } = args;
        const { user, models } = context;
        if (!user) throw new AuthenticationError(`Not authenticated`);
        if (!channelId) throw new ValidationError('channelId is required');

        const channel = await models.Channel.findOne({
            where: { id: channelId }
        });
        context.channel = channel.dataValues;

        const member = await models.WorkspaceMember.findOne({
            where: { workspaceId: channel.workspaceId, userId: user.id }
        });

        if (!member) throw new ForbiddenError('You need to be a member');
        context.isMember = true;
        return resolver(root, args, context, info);
    };
};

// catch async errors
exports.catchAsync = (resolver) => {
    return (root, args, context, info) => {
        resolver(root, args, context, info).catch((error) => new Error(error)); // err => next(err)
        // if there is error. err object is sent straight to the global errorController
    };
};
