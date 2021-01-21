const { ValidationError } = require('apollo-server-express');

const {
    models: { Channel, ChannelMember }
} = require('../models');

exports.createChannel = async (args) => {
    const { name, owner } = args;

    // let channel = await Channel.findOne({
    //     where: {
    //         name
    //     }
    // });
    // // console.log(Channel);
    // if (channel) {
    //     throw new ValidationError('Channel name already exist', 400);
    // }
    const channel = await Channel.create({
        name,
        owner
    });

    return channel;
};

exports.addMember = async (args) => {
    // const {} = args;
    const { channelId, userId } = args;

    const response = await ChannelMember.create({
        channelId,
        userId
    });

    // if (!Channel) {
    //     throw new ValidationError('Channel name already exist', 400);
    // }
    // console.log(Channel);
    return response;
};

exports.getChannels = async (args) => {
    const channel = await Channel.findAll();
    // if (!Channel) {
    //     throw new ValidationError('Channel name already exist', 400);
    // }
    // console.log(Channel);
    return channel;
};

exports.getChannel = async (args) => {
    const { id } = args;

    const channel = await Channel.findByPk(id);
    // if (!channel) {
    //     throw new ValidationError('Channel name already exist', 400);
    // }
    // console.log(Channel);
    return channel;
};
