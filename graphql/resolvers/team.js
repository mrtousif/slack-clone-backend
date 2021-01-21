// const { UserInputError } = require('apollo-server-express');
const teamCtrl = require('../../controllers/team');
const userCtrl = require('../../controllers/user');

module.exports = {
    Query: {
        getTeam: async (_, args, ctx, info) => {
            const { id } = args;
            const { models } = ctx;
            // await userCtrl.signup(
            const team = await teamCtrl.getTeam();
            // console.log(team);
            return team;
        },

        getTeams: async (_, args, ctx, info) => {
            // const { id } = args;
            // const { models } = ctx;

            // verify authentication
            // const user = await userCtrl.protect({ req });
            const team = await teamCtrl.getTeams();
            // console.log(team);
            return team;
        }
    },

    Mutation: {
        createTeam: async (_, args, ctx, info) => {
            const { name } = args;
            const { req } = ctx;
            // verify authentication
            const user = await userCtrl.protect({ req });
            const createdTeam = await teamCtrl.createTeam({
                name,
                owner: user.id,
                req
            });
            // console.log(createdTeam);
            return createdTeam;
        }
    }
};

// deleteTeam: async (_, args, ctx, info) => {
//     const { id } = args;
//     const { models } = ctx;
//     // await userCtrl.signup(
//     const createdTeam = await models.Team.delete({
//         id
//     });
//     console.log(createdTeam);
//     return createdTeam;
// }

// getUser: async (_, args) => {
//     const { email, password } = args;
//     const user = await userCtrl.login({ email, password });
//     return user;
// },
// getAllUsers: async (_, args) => {
//     const { email, password } = args;
//     const user = await userCtrl.login({ email, password });
//     return user;
// }
