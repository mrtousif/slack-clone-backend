const {
    withFilter,
    UserInputError,
    ForbiddenError
} = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { GraphQLUpload } = require('graphql-upload');
const { authenticate } = require('../high-order-resolvers');

const NEW_MESSAGE = 'NEW_MESSAGE';

// const { pubsub, models, user } = ctx;
// const { channelId } = args;
// // check if part of the team
// // const channel = await models.Channel.findByPk(channelId);
// return pubsub.asyncIterator(NEW_MESSAGE);
module.exports = {
    DateTime: DateTimeResolver,
    Upload: GraphQLUpload,

    Subscription: {
        newMessage: {
            subscribe: withFilter(
                authenticate((_parent, _args, { pubsub }) =>
                    pubsub.asyncIterator(NEW_MESSAGE)
                ),
                (payload, args) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation

                    return payload.channelId === args.channelId;
                }
            )
        }
    },

    Message: {
        user: authenticate(async ({ userId }, _args, { models }) => {
            // console.log(userId);
            const user = await models.User.findByPk(userId);

            return user;
        }),
        url: (parent) => {
            // console.log(parent);
            return parent.fileName
                ? `http://localhost:5000/static/${parent.fileName}`
                : null;
        }
    },

    Query: {
        getMessages: authenticate(async (_parent, args, context, _info) => {
            try {
                const { channelId } = args;
                const { models, user } = context;
                const channel = await models.Channel.findByPk(channelId);
                if (!channel) {
                    throw new ValidationError('Invalid channelId');
                }
                if (channel.private) {
                    const member = await models.PrivateChannelMember.findOne({
                        where: { channelId, userId: user.id }
                    });
                    if (!member) {
                        throw new ForbiddenError('Not authorized');
                    }
                }

                const messages = await models.Message.findAll({
                    where: { channelId },
                    order: [['createdAt', 'DESC']]
                    // include: models.User,
                    // raw: true
                });

                if (!channel.private) {
                    const channelMember = await models.ChannelMember.findOne({
                        where: { channelId, userId: user.id }
                    });
                    if (!channelMember) {
                        models.ChannelMember.create({
                            userId: user.id,
                            channelId
                        });
                    }
                }

                // console.log(messages);

                return messages;
            } catch (error) {
                // console.log(error);
                throw error;
            }
        })
    },

    Mutation: {
        createMessage: authenticate(async (_, args, ctx, _info) => {
            try {
                const { channelId, text, file } = args;
                const { models, pubsub, user } = ctx;
                if (text.trim().length === 0 && !file) {
                    throw new UserInputError('Message cannot be empty');
                }
                let uploadedFile = {};

                if (file) {
                    uploadedFile = await ctx.storeUpload(file);
                    console.log(uploadedFile);
                }

                const createdMessage = await models.Message.create({
                    channelId,
                    text,
                    userId: user.id,
                    fileName: uploadedFile.filename,
                    fileType: uploadedFile.mimetype
                });

                pubsub.publish(NEW_MESSAGE, {
                    channelId,
                    newMessage: createdMessage.dataValues
                });

                return createdMessage;
            } catch (error) {
                console.error(error);
                throw error;
            }
        })
    }
};
