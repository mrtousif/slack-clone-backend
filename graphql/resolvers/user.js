// const { UserInputError } = require('apollo-server-express');
const userCtrl = require('../../controllers/user');

module.exports = {
    Query: {
        getUser: async (_, args, ctx) => {
            const { id } = args;
            const { models } = ctx;
            const user = await models.User.findOne({ where: { id } });
            return user;
        }
    },

    Mutation: {
        signup: async (_, args, ctx, info) => {
            const { name, email, password, confirmPassword } = args;
            const { models, req } = ctx;
            // await
            const createdUser = await userCtrl.signup({
                name,
                email,
                password,
                confirmPassword
            });
            // console.log(createdUser);
            return createdUser;
        },

        login: async (_, args) => {
            const { email, password } = args;
            const user = await userCtrl.login({ email, password });

            return user;
        }
    }
};

// getAllUsers: async (_, args, ctx) => {
//     const { models } = ctx;
//     const users = await models.User.find();
//     return users;
// }

// getAllUsers: async (_, args) => {
//     const { email, password } = args;
//     const user = await userCtrl.login({ email, password });
//     return user;
// }
