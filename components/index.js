const { Sequelize } = require('sequelize');
const user = require('./user/user.model');
const workspace = require('./workspace/workspace.model');
const message = require('./message/message.model');
const channel = require('./channel/channel.model');
const workspaceMember = require('./workspace_member/model');
const channelMember = require('./channel_member/channel-member.model');
const directMessage = require('./direct_message/direct-message.model');
const privateChannelMember = require('./channel_member/private-channel-member.model');

const DB = process.env.NODE_ENV === 'test' ? 'test_slack' : 'slack';

const sequelize = new Sequelize(DB, 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
    // logQueryParameters: true
    // define: {
    //     underscored: true
    // }
});

const models = {
    User: user(sequelize),
    Workspace: workspace(sequelize),
    Message: message(sequelize),
    Channel: channel(sequelize),
    WorkspaceMember: workspaceMember(sequelize),
    ChannelMember: channelMember(sequelize),
    DirectMessage: directMessage(sequelize),
    PrivateChannelMember: privateChannelMember(sequelize)
};

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

module.exports = { sequelize, models, Sequelize };
