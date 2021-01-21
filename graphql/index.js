// ./graphql/typeDefs.js
const path = require('path');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

const schemaArray = loadFilesSync(path.join(__dirname, './schemas'));
const resolverArray = loadFilesSync(path.join(__dirname, './resolvers'));

const typeDefs = mergeTypeDefs(schemaArray);
const resolvers = mergeResolvers(resolverArray);

// const typeDefs = require('./schemas/main');
// const resolvers = require('./resolvers/main');

module.exports = {
    typeDefs,
    resolvers
};
