// eslint-disable prevent-abbreviations
require('dotenv').config();
const http = require('http');
const { ApolloServer, ValidationError } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql');
const { models, sequelize } = require('./components');
const app = require('./app');
const storeUpload = require('./store-upload');
const pubsub = require('./pubsub');
const userCtrl = require('./components/user/user.controller');

const server = new ApolloServer({
    uploads: false,
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
        let token = null;
        let user = null;
        let isAuthenticated = false;

        // console.log('context', req);
        if (connection) {
            // Operation is a Subscription
            token = connection.context.token;
        } else if (req && req.headers.authorization) {
            // Operation is a Query/Mutation
            // Obtain header-provided token from req.headers
            token = req.headers.authorization;
        }

        if (token) {
            user = await userCtrl.isAuthenticated(token);
            if (user) isAuthenticated = true;
        }

        return {
            isAuthenticated,
            user,
            req,
            models,
            sequelize,
            pubsub,
            storeUpload
        };
    },
    subscriptions: {
        path: '/subscriptions',
        // eslint-disable-next-line unicorn/prevent-abbreviations
        onConnect: async (connectionParams, _webSocket, _context) => {
            console.log('Client connected');
            // console.log('connectionParams:', connectionParams);
            if (connectionParams.token) {
                return { token: connectionParams.token };
            }

            throw new ValidationError('Missing auth token!');
        }
        // onDisconnect: (_webSocket, _context) => {
        //     console.log('Client disconnected');
        // }
    }
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const PORT = process.env.PORT || 5000;

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log('Database connected');
        httpServer.listen(PORT, () => {
            console.log(
                `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
            );
            console.log(
                `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
            );
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

process.on('unhandledRejection', (error) => {
    console.error(error);
    console.log('Shutting Down the server...');
    // safely close
    httpServer.close(() => {
        // kill
        process.exit(1);
    });
});
