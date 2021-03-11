const { ValidationError, ForbiddenError } = require('apollo-server-express');
const workspaceCtrl = require('../../components/workspace/workspace.controller');
const { authenticate } = require('../high-order-resolvers');
const { Op } = require('sequelize');

module.exports = {
    Workspace: {
        channels: authenticate(
            async ({ id }, _args, { models, sequelize, user }) => {
                // const response = await models.Channel.findAll({
                //     where: { workspaceId: id }
                // });

                const channels = await sequelize.query(
                    'SELECT DISTINCT ON (c."id") c."id", c."name", c."private", "admin", "description",  "workspaceId"  FROM "channels" AS c LEFT OUTER JOIN "privateChannelMembers" AS pcm ON c."id" = pcm."channelId" where c."workspaceId" = :workspaceId AND (c."private" = false OR pcm."userId" = :userId)',
                    {
                        replacements: { workspaceId: id, userId: user.id },
                        model: models.Channel,
                        raw: true
                    }
                );
                // console.log(channels);
                return channels;
            }
        ),

        directMessageMembers: authenticate(async ({ id }, _args, ctx) => {
            const { models, sequelize, user } = ctx;
            // "users"."id" = "directMessages"."receiverId"
            //
            const members = await sequelize.query(
                'SELECT DISTINCT ON ("users"."id") "users"."id", "users"."name", "users"."photo" FROM "directMessages" AS "dm", "users" where "dm"."workspaceId"= :workspaceId AND ("dm"."receiverId" = :userId OR "dm"."senderId" = :userId) AND ("users"."id" = "dm"."receiverId" OR "users"."id" = "dm"."senderId")',
                {
                    replacements: { userId: user.id, workspaceId: id },
                    model: models.User,
                    raw: true
                }
            );

            if (members.length === 0) {
                members.push({
                    id: user.id,
                    name: user.name,
                    photo: user.photo
                });
            }

            // console.log('members response:', members);
            return members;
        })
    },

    Query: {
        getWorkspace: authenticate(async (_, args, _ctx) => {
            const { workspaceId } = args;
            const workspace = await workspaceCtrl.getWorkspaceById(workspaceId);
            // console.log(workspace);
            return workspace;
        }),

        getWorkspacesByUser: authenticate(async (_, _args, ctx) => {
            const { user, models } = ctx;
            const workspace = await models.Workspace.findAll({
                include: {
                    model: models.User,
                    where: { id: user.id }
                }
            });
            return workspace;
        }),

        getWorkspaceMembers: authenticate(async (_, args, ctx) => {
            const { sequelize, models } = ctx;
            const { workspaceId } = args;
            const members = await sequelize.query(
                'SELECT "users"."id" AS "id", "name", "photo" FROM "workspaceMembers", "users" where "workspaceMembers"."workspaceId" = :workspaceId AND "workspaceMembers"."userId" = "users"."id"',
                {
                    replacements: { workspaceId },
                    model: models.User,
                    raw: true
                }
            );
            // console.log(members);
            return members;
        })
    },

    Mutation: {
        createWorkspace: authenticate(async (_, args, ctx, _info) => {
            // try {
            const { name } = args;
            const { user, models, sequelize } = ctx;

            const response = await sequelize.transaction(
                async (transaction) => {
                    const newWorkspace = await workspaceCtrl.createWorkspace(
                        { name, owner: user.id },
                        { transaction }
                    );
                    await models.WorkspaceMember.create(
                        {
                            workspaceId: newWorkspace.id,
                            userId: user.id,
                            admin: true
                        },
                        { transaction }
                    );

                    const channels = await models.Channel.bulkCreate(
                        [
                            {
                                name: 'general',
                                owner: user.id,
                                workspaceId: newWorkspace.id
                            },
                            {
                                name: 'random',
                                owner: user.id,
                                workspaceId: newWorkspace.id
                            }
                        ],
                        { transaction }
                    );
                    newWorkspace.channels = channels;
                    // console.log(newWorkspace);
                    return newWorkspace;
                }
            );

            return response;
            // } catch (error) {
            //     throw error;
            // }
        }),

        addWorkspaceMembers: authenticate(async (_, args, ctx, _info) => {
            // try {
            const { emails, workspaceId } = args;
            const { user, models } = ctx;
            const memberPromise = models.WorkspaceMember.findOne({
                where: { userId: user.id }
            });

            const usersToAddPromise = models.User.findAll({
                attributes: ['id', 'email'],
                where: {
                    email: { [Op.in]: emails }
                }
            });

            const [member, usersToAdd] = await Promise.all([
                memberPromise,
                usersToAddPromise
            ]);
            if (!member.admin)
                throw new ForbiddenError("You don't have permission");

            if (usersToAdd.length === 0)
                throw new ValidationError('User does not exist');

            const members = usersToAdd.map((user) => {
                return {
                    workspaceId,
                    userId: user.id
                };
            });
            // console.log(members);
            await models.WorkspaceMember.bulkCreate(members);
            // console.log(createdMembers);

            return {
                ok: true
            };
            // } catch (error) {
            //     throw error;
            // }
        })
    }
};

// deleteWorkspace: async (_, args, ctx, info) => {
//     const { id } = args;
//     const { models } = ctx;
//     // await userCtrl.signup(
//     const createdWorkspace = await models.workspace.delete({
//         id
//     });
//     console.log(createdWorkspace);
//     return createdWorkspace;
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
