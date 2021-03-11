const {
    ForbiddenError,
    UserInputError,
    ValidationError
} = require('apollo-server-express');
const { Op } = require('sequelize');
const { authenticate } = require('../high-order-resolvers');

module.exports = {
    Channel: {
        messages: authenticate(async ({ id }, args, { models }) => {
            const response = await models.Message.findAll({
                where: { channelId: id }
            });
            // console.log('messages response:', response);
            return response;
        }),

        // owner: async ({ owner }, args, { models }) =>
        //     await models.User.findByPk(owner),

        members: authenticate(
            async ({ id, private }, args, { models, sequelize }) => {
                let members;
                if (private) {
                    members = await sequelize.query(
                        'SELECT * FROM "privateChannelMembers" AS pcm, "users" where pcm."channelId"= :channelId AND pcm."userId" = "users"."id"',
                        {
                            replacements: { channelId: id },
                            raw: true,
                            model: models.User
                        }
                    );
                } else {
                    members = await sequelize.query(
                        'SELECT * FROM "channelMembers" AS cm, "users" where cm."channelId"= :channelId AND cm."userId" = "users"."id"',
                        {
                            replacements: { channelId: id },
                            raw: true,
                            model: models.User
                        }
                    );
                }

                // console.log(members);
                return members;
            }
        )
    },

    Query: {
        getChannel: authenticate(async (_, args, ctx, _info) => {
            const { channelId } = args;
            const { models } = ctx;
            const channel = await models.Channel.findByPk(channelId);
            if (!channel) {
                throw new UserInputError('Invalid channelId');
            }
            // console.log(channel);
            return channel;
        }),

        getChannels: authenticate(
            async (_, { workspaceId }, { sequelize }, _info) => {
                const channels = await sequelize.query(
                    'SELECT * FROM channels, channelMembers where channels.id = channelMembers.channelId AND channels.workspaceId = :workspaceId',
                    {
                        replacements: { workspaceId },
                        model: models.Channel,
                        raw: true
                    }
                );
                console.log(channels);
                return channels;
            }
        ),
        getMembersToAddToTheChannel: authenticate(
            async (_parent, args, context, _info) => {
                const { workspaceId, channelId } = args;
                const { models } = context;
                const channel = await models.Channel.findByPk(channelId);
                let channelMembers;
                if (channel.private) {
                    channelMembers = await models.PrivateChannelMember.findAll({
                        where: {
                            channelId
                        },
                        raw: true
                    });
                } else {
                    channelMembers = await models.ChannelMember.findAll({
                        where: {
                            channelId
                        },
                        raw: true
                    });
                }

                const channelMembersIds = channelMembers.map(
                    (member) => member.userId
                );
                const workspaceMembers = await models.WorkspaceMember.findAll({
                    where: {
                        workspaceId,
                        userId: { [Op.notIn]: channelMembersIds }
                    },

                    raw: true
                });

                console.log(workspaceMembers);
                // const [workspaceMembers, channelMembers] = await Promise.all([
                //     workspaceMembersPromise,
                //     channelMembersPromise
                // ]);

                return channelMembers;
            }
        )
    },

    Mutation: {
        createChannel: authenticate(async (_, args, ctx, _info) => {
            const { name, workspaceId, private } = args;
            const { user, models, sequelize } = ctx;
            // get member
            const member = await models.WorkspaceMember.findOne({
                where: { userId: user.id, workspaceId }
            });
            if (!member.admin)
                throw new ForbiddenError(
                    'You do not have permission to do that'
                );

            const channel = await models.Channel.findOne({
                where: { workspaceId, name }
            });

            if (channel) {
                throw new ValidationError('Channel name already exist');
            }
            const response = await sequelize.transaction(
                async (transaction) => {
                    const newChannel = await models.Channel.create(
                        {
                            name,
                            workspaceId,
                            owner: user.id,
                            private
                        },
                        { transaction }
                    );

                    if (private) {
                        await models.PrivateChannelMember.create(
                            {
                                channelId: newChannel.id,
                                userId: user.id,
                                admin: true
                            },
                            { transaction }
                        );
                    } else {
                        await models.ChannelMember.create(
                            {
                                channelId: newChannel.id,
                                userId: user.id,
                                admin: true
                            },
                            { transaction }
                        );
                    }

                    return newChannel;
                }
            );

            // console.log(newChannel);
            return response;
        }),

        addChannelMembers: authenticate(async (_, args, ctx, _info) => {
            const { channelId, userIds } = args;
            const { models } = ctx;
            // get the channel
            const channel = await models.Channel.findByPk(channelId);
            if (!channel) throw new ValidationError('Invalid channelId');

            const members = userIds.map((userId) => ({
                channelId,
                userId
            }));
            const addedMembers = await models.PrivateChannelMember.bulkCreate(
                members
            );

            console.log(addedMembers);
            return addedMembers;
        }),

        deleteChannel: authenticate(async (_, args, ctx, _info) => {
            const { id } = args;
            const { models } = ctx;
            const createdWorkspace = await models.Channel.delete({
                id
            });
            return createdWorkspace;
        })
    }
};
