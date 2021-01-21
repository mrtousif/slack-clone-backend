// const { DateTimeResolver, EmailAddressResolver } = require("graphql-scalars");

// A map of functions which return data for the schema.
module.exports = {
    Query: {
        hi: (parent, args, context, info) => 'hello world'
    },

    Mutation: {
        createMessage: async (_, args, ctx, info) => {
            const { name, owner } = args;
            const { models } = ctx;
            // await userCtrl.signup(
            const createdMessage = await models.Message.create({
                name,
                owner
            });
            console.log(createdMessage);
            return createdMessage;
        },

        deleteMessage: async (_, args, ctx, info) => {
            const { id } = args;
            const { models } = ctx;
            // await userCtrl.signup(
            const deletedMessage = await models.Message.delete({
                id
            });

            console.log(deletedMessage);
            return null;
        }
    }
};

// ...commentResolvers.Subscription,

// Profile: {
// likeCount: (parent) => {
//     console.log(parent);
//     return parent.likes.length;
// },
// commentCount: (parent) => parent.comments.length,
// },

// ...replyResolvers.Query,
