// const { UserInputError } = require('apollo-server-express');
const userCtrl = require('../../components/user/user.controller');
const { authenticate } = require('../high-order-resolvers');

module.exports = {
    Query: {
        getUser: authenticate(async (_, { userId }, ctx) => {
            const { models } = ctx;
            return models.User.findByPk(userId);
        }),

        getUserWorkspaces: authenticate(async (_parent, _args, ctx, _info) => {
            const { user, models, sequelize } = ctx;
            // double join slower query
            // const workspace = await models.Workspace.findAll({
            //     include: [{ model: models.User, where: { id: user.id } }]
            // });
            // single join faster query
            const workspaces = await sequelize.query(
                'SELECT "id", "name", "owner", "workspaceId", "userId","admin" FROM "workspaces", "workspaceMembers" WHERE "id" = "workspaceId" AND "workspaceMembers"."userId" = :userId',
                {
                    replacements: { userId: user.id },
                    model: models.Workspace,
                    raw: true
                }
            );
            // console.log(workspaces);

            return workspaces;
        })
    },

    Mutation: {
        signup: async (_, args, _ctx, _info) => {
            const { name, email, password, confirmPassword } = args;
            // const { models, req } = ctx;
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
            // console.log(user);
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

// getWorkspacesAsOwner: authenticate(async (_, args, ctx, info) => {
//     const { user, models } = ctx;
//     // verify authentication
//     const workspace = await models.Workspace.findAll({
//         where: { owner: user.id }
//     });
//     // console.log(workspace);
//     return workspace;
// })
