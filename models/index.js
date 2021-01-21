const { Sequelize } = require('sequelize');
const User = require('./user.js');
const Team = require('./team.js');
const Message = require('./message.js');
const Channel = require('./channel.js');
const ChannelMember = require('./channelMember');

const sequelize = new Sequelize('slack', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
    logQueryParameters: false
    // define: {
    //     underscored: true
    // }
});

const models = {
    User: User(sequelize),
    Team: Team(sequelize),
    Message: Message(sequelize),
    Channel: Channel(sequelize),
    ChannelMember: ChannelMember(sequelize)
};

// const modelDefiners = [
//     require('./user.js'),
//     require('./team.js'),
//     //  require('./member.js'),
//     require('./message.js'),
//     require('./channel.js')
//     // Add more models here...
//     // require('./models/item'),
// ];

// We define all models according to their files.
// for (const modelDefiner of modelDefiners) {
//     modelDefiner(sequelize);
// }

Object.keys(models).forEach((modelName) => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

// We execute any extra setup after the models are defined, such as adding associations.
// applyExtraSetup(sequelize);

// models.sequelize = sequelize;
// models.Sequelize = Sequelize;

module.exports = { sequelize, models };
