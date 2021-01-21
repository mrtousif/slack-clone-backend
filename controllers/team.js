const { ValidationError } = require('apollo-server-express');

const {
    models: { Team }
} = require('../models');

exports.createTeam = async (args) => {
    const { name, owner, req } = args;

    let team = await Team.findOne({
        where: {
            name
        }
    });
    // console.log(team);
    if (team) {
        throw new ValidationError('Team name already exist', 400);
    }

    team = await Team.create({
        name,
        owner
    });

    return team;
};

exports.getTeams = async (args) => {
    // const {} = args;

    const team = await Team.findAll();
    // if (!team) {
    //     throw new ValidationError('Team name already exist', 400);
    // }
    // console.log(team);
    return team;
};

exports.getTeam = async (args) => {
    const { id } = args;

    const team = await Team.findByPk(id);
    // if (!team) {
    //     throw new ValidationError('Team name already exist', 400);
    // }
    // console.log(team);
    return team;
};
