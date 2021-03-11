const axios = require('axios');
// const server = require('../server');

// test.beforeEach((t) => {
//     const script = new Script({});
//     Object.assign(t.context, { script });
// });

const URL = 'http://localhost:5000/graphql';

describe('User Resolver', () => {
    describe('User signup', () => {
        test('should sign up successfully', async () => {
            const { data } = await axios.post(URL, {
                query: `
                    mutation{
                        signup(
                            name: "Jess",
                            email: "jess@alkon.com"
                            password: "jess@alkon.com",
                            confirmPassword: "jess@alkon.com"
                        ){
                            id
                            name,
                            email,
                            photo,
                            token
                        }
                    }

                `
            });

            console.log(data);
            expect(data).toMatchObject({});
        });
    });

    describe('When requesting user data while not sending the token', () => {
        test('should return not authenticated error', async () => {
            const { data } = await axios.post(
                URL,
                {
                    query: `
                        query getUser{
                            getUser(userId: "00b1328d-222e-44e9-a0f5-58f3a3e8c30a"){
                                name
                            }
                        }
                    `
                },
                {
                    headers: {
                        authorization: `Bearer`
                    }
                }
            );

            expect(data).toMatchObject({
                errors: [
                    {
                        message: 'Not authenticated. Please login',
                        path: ['getUser'],
                        extensions: {
                            code: 'UNAUTHENTICATED'
                        }
                    }
                ],
                data: null
            });
        });
    });
});

// test('renders name', (t) => {
//     const { script } = t.context;
//     t.is(script.renderName(), 'script');
// });

// test('sets a default name', (t) => {
//     const { script } = t.context;
//     t.is(script._name, 'script');
// });
