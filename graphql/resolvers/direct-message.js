const { withFilter } = require('apollo-server-express');
const { authenticate } = require('../high-order-resolvers');
const { Op } = require('sequelize');

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';

module.exports = {
    Subscription: {
        newDirectMessage: {
            subscribe: withFilter(
                authenticate((_parent, _args, { pubsub }) =>
                    pubsub.asyncIterator(NEW_DIRECT_MESSAGE)
                ),
                (payload, args, { user }) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    // console.log('payload:', payload, 'args:', args);
                    return (
                        payload.workspaceId === args.workspaceId &&
                        (payload.newDirectMessage.senderId === user.id ||
                            payload.newDirectMessage.receiverId === user.id)
                    );
                }
            )
        }
    },

    DirectMessage: {
        receiver: authenticate(async ({ receiverId }, _args, { models }) => {
            // console.log(receiverId);
            const user = await models.User.findByPk(receiverId);

            return user;
        }),

        user: authenticate(async ({ senderId }, _args, { models }) => {
            const user = await models.User.findByPk(senderId);

            return user;
        })
    },

    Query: {
        getDirectMessages: authenticate(
            async (_parent, args, context, _info) => {
                const { receiverId } = args;
                const { models, user } = context;
                const messages = await models.DirectMessage.findAll({
                    where: {
                        receiverId: {
                            [Op.or]: [receiverId, user.id]
                        },
                        senderId: {
                            [Op.or]: [receiverId, user.id]
                        }
                    },
                    // include: models.User
                    order: [['createdAt', 'DESC']]
                });
                // console.log(messages);

                return messages;
            }
        )
    },

    Mutation: {
        createDirectMessage: authenticate(async (_, args, ctx, _info) => {
            const { receiverId, text, workspaceId } = args;
            const { models, pubsub, user } = ctx;

            const newMessage = await models.DirectMessage.create({
                receiverId,
                text,
                senderId: user.id,
                workspaceId
            });
            // const newMessage = await message.getUser();

            pubsub.publish(NEW_DIRECT_MESSAGE, {
                receiverId,
                workspaceId,
                newDirectMessage: newMessage.dataValues
            });

            // console.log('newMessage', newMessage);
            return newMessage;
        })
    }
};

// deleteDirectMessage: authenticate(async (_, args, ctx, info) => {
//     const { id } = args;
//     const { models } = ctx;
//     const deletedMessage = await models.DirectMessage.delete({
//         where: { id }
//     });

//     // console.log(deletedMessage);
//     return null;
// })
