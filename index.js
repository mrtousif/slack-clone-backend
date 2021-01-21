// eslint-disable prevent-abbreviations
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql');
const { models, sequelize } = require('./models');
// const errorController = require('./controllers/error');
require('dotenv').config();

const app = express();

app.use(express.json());

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, models })
});

server.applyMiddleware({ app });

app.use((request, res) => {
    res.status(200);
    res.send('Hello!');
    res.end();
});

// fallback route
app.all('/*', (request, res) => {
    // const err = new Error(`${req.url} does not exist`);
    // err.statusCode = 404;
    // err.status = 'fail';
    res.status(404).json({
        status: 'fail',
        message: `${request.url} does not exist`
    });
});

// global error handling middleware
// app.use(errorController);

// models.sequelize
//     .authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//         app.listen({ port: 5000 }, () =>
//             console.log(
//                 `🚀 Server ready at http://localhost:5000${server.graphqlPath}`
//             )
//         );
//     })
//     .catch((err) => {
//         console.error('Unable to connect to the database:', err);
//     });

sequelize
    .sync({ alter: true })
    .then(() => {
        app.listen({ port: 5000 }, () =>
            console.log(
                `🚀 Server ready at http://localhost:5000${server.graphqlPath}`
            )
        );
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });
