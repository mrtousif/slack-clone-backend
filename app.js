const express = require('express');

const { graphqlUploadExpress } = require('graphql-upload');

// const { altairKoa } = require('altair-koa-middleware');
// const logger = require('pino-http')({
//     prettyPrint: true
// });
const app = express();

app.use(express.json());
app.use(
    graphqlUploadExpress({
        maxFileSize: 90000000, // 90 MB
        maxFiles: 20
    })
);

app.use('/static', express.static('uploads'));

// const addUser = async (req, res, next) => {
//     const token = req.headers['x-token'];
//     if (token) {
//         try {
//             const { user } = jwt.verify(token, SECRET);
//             req.user = user;
//         } catch (err) {
//             const refreshToken = req.headers['x-refresh-token'];
//             const newTokens = await refreshTokens(
//                 token,
//                 refreshToken,
//                 models,
//                 SECRET,
//                 SECRET2
//             );
//             if (newTokens.token && newTokens.refreshToken) {
//                 res.set(
//                     'Access-Control-Expose-Headers',
//                     'x-token, x-refresh-token'
//                 );
//                 res.set('x-token', newTokens.token);
//                 res.set('x-refresh-token', newTokens.refreshToken);
//             }
//             req.user = newTokens.user;
//         }
//     }
//     next();
// };

// global error handling middleware
// app.use(errorController);

// app.use(
//     '/graphiql',
//     altairExpress({
//         endpointURL: '/graphql',
//         subscriptionsEndpoint: `ws://localhost:5000/subscriptions`
//         // initialQuery: `{ getData { id name surname } }`
//     })
// );

module.exports = app;
