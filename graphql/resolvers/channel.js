// const { UserInputError } = require('apollo-server-express');
const channelCtrl = require('../../controllers/channel');
const userCtrl = require('../../controllers/user');

module.exports = {
    Query: {
        // eslint-disable-next-line no-unused-vars
        getChannel: async (_, args, ctx, info) => {
            const { id } = args;
            // const { models } = ctx;
            // await userCtrl.signup(
            const channel = await channelCtrl.getChannel({ id });
            // console.log(channel);
            return channel;
        },
        // eslint-disable-next-line no-unused-vars
        getChannels: async (_, args, ctx, info) => {
            // const { id } = args;
            // const { models } = ctx;

            // verify authentication
            // const user = await userCtrl.protect({ req });
            const channel = await channelCtrl.getChannels();
            // console.log(channel);
            return channel;
        }
    },

    Mutation: {
        // eslint-disable-next-line no-unused-vars
        createChannel: async (_, args, ctx, info) => {
            const { name } = args;
            const { req } = ctx;
            // verify authentication
            const user = await userCtrl.protect({ req });
            const createdChannel = await channelCtrl.createChannel({
                name,
                owner: user.id,
                req
            });
            // console.log(createdChannel);
            return createdChannel;
        },
        // eslint-disable-next-line no-unused-vars
        addChannelMember: async (_, args, ctx, info) => {
            const { id, userId } = args;
            const { req } = ctx;
            // verify authentication
            // eslint-disable-next-line no-unused-vars
            const user = await userCtrl.protect({ req });
            // userCtrl.restrictTo(['owner']);
            const createdTeam = await channelCtrl.addMember({
                channelId: id,
                userId
            });

            console.log(createdTeam);
            return createdTeam;
        },
        // eslint-disable-next-line no-unused-vars
        deleteChannel: async (_, args, ctx, info) => {
            const { id } = args;
            const { models } = ctx;
            // verify authentication
            const user = await userCtrl.protect({ req });
            const createdTeam = await models.Channel.delete({
                id
            });
            console.log(createdTeam);
            return createdTeam;
        }
    }
};
// getAllUsers: async (_, args) => {
//     const { email, password } = args;
//     const user = await userCtrl.login({ email, password });
//     return user;
// }
