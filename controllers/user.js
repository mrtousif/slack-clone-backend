const { promisify } = require('util'); // promisify() makes a synchronous function asynchronous
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
    models: { User }
} = require('../models/index');
// const Profile = require("../profile/profile.model");
// const backblaze = require("./backblaze");

const {
    ValidationError,
    AuthenticationError
} = require('apollo-server-express');

// const downloadUrl = backblaze();
// const Email = require("../utils/Email");

const signToken = (user) => {
    const { id, name, email, photo } = user;

    const token = jwt.sign({ id, name, email, photo }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES_IN // validity of the token
    });

    return token;
};

const signAndSendToken = (user) => {
    if (!user) throw new Error('user is required');

    const token = signToken(user);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true // not modifiable by the browser
    };
    // users will be able to log in only in https connection in production
    if (process.env.NODE_ENV === 'production') {
        // when in production cookie will be sent only on https connection
        cookieOptions.secure = true;
    }
    // send cookie
    // res.cookie("token", token, cookieOptions);

    user.password = undefined; // when sending user data in response
    user.passwordChangedAt = undefined;
    // const photo = user.photo;
    user.token = token;

    // user.photo = `https://f000.backblazeb2.com/file/user-profile-pics/${photo}`;

    return user;
};

// create user account
exports.signup = async ({ name, email, password, confirmPassword }) => {
    // never do: const newUser = await User.create(req.body)
    // check if user account already exists in the db
    if (!name || !email || !password || !confirmPassword) {
        throw new ValidationError(
            'A name, email, password and confirmPassword are required.'
        );
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
        throw new ValidationError(
            'An account with that email is already exist. You can login or reset password.'
        );
    }

    if (password !== confirmPassword) {
        throw new ValidationError('Password did not match');
    }

    // load new user data into the db
    const newUser = await User.create({
        name,
        email,
        password
    });

    // await Profile.create({
    //     user: newUser._id,
    // });

    // send email
    // const url = `${req.protocol}://${req.get("host")}/me`;

    // await new Email(newUser, url).sendWelcome();
    // send token
    return signAndSendToken(newUser);
};

// Stage 1 Authentication --- Login --- check for identity
exports.login = async ({ email, password }) => {
    if (!email || !password) {
        throw new ValidationError('An email and password is required.');
    }

    // find user account in db
    const user = await User.findOne({ where: { email } });
    // console.log(user);
    // .select('+password')
    // check if user exists, if yes then check password if incorrect send error
    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new ValidationError('Incorrect email or password', {
            statusCode: 401
        });
    }

    // if everything is ok then sign and send token to the client
    return signAndSendToken(user);
};

// Stage 2 authentication --- Access to logged in user
exports.protect = async ({ req }) => {
    if (!req) throw new Error('req is not defined');
    // Get token and check if it exists
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // extract the token part from the string
        token = req.headers.authorization.split(' ')[1];
        // remove quotes if any
        token = token.replace(/^"(.*)"$/, '$1');
    }

    // check token if it exists
    if (!token || token === 'undefined') {
        throw new AuthenticationError('You need to login to get access');
    }

    // console.log(token);
    // verify token and extract data
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    // decoded{ id: '---', iat: ---, exp: --- }
    // check if user exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new AuthenticationError('Please login first');
    }

    // check if user has changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        throw new AuthenticationError(
            'Password changed recently. Please login'
        );
    }

    // load user data to the request object
    req.user = user;

    // grant access to the protected route
    return user;
};

exports.isLoggedIn = async ({ req }) => {
    try {
        if (!req) throw new Error('req is not defined');
        //! req.cookies.token ||
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // extract the token part from the string
            // console.log(req.headers.authorization);
            token = req.headers.authorization.split(' ')[1];
            // remove quotes if any
            token = token.replace(/^"(.*)"$/, '$1');
            // console.log(token);
            // const token = req.cookies.token;
            // verify token and extract data
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );
            // console.log(decoded)
            // check if user exists
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return;
            }

            // console.log(user);
            // check if user has changed password after the token was issued
            if (user.changedPasswordAfter(decoded.iat)) {
                return;
            }

            // user is logged in
            // make it accessible to the template
            // res.locals.user = user;
            return user;
        }
    } catch (err) {
        return err;
    }
};

// exports.logout = (request, res) => {
//     res.cookie('jwt', 'dummy_text', {
//         expires: new Date(Date.now() + 1000), // 1second
//         httpOnly: true
//     });

//     res.status(200).json({
//         status: 'success'
//     });
// };

// Authorization --- check for permission
// exports.restrictTo = (...roles) => {
//     return (request, res, next) => {
//         // roles = ['admin', 'lead-guide']
//         // check if current user role is in roles[]
//         if (!roles.includes(request.user.role)) {
//             // unauthorized
//             throw new ValidationError(
//                 'You do not have permission to perform this action',
//                 403
//             );
//         }

//         // grant access
//         next();
//     };
// };

// exports.forgotPassword = async ({ req, res }) => {
//     // find sent email in the db
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//         throw new ValidationError('You need to sign up', 404);
//     }

//     // generate temporary password or random reset token
//     const resetToken = user.createPasswordResetToken();
//     // deactivate validators of the user and save it to the db
//     await user.save({ validateBeforeSave: false });

//     // send it to the user's email
//     try {
//         // create reset url
//         const resetUrl = `${req.protocol}://${req.get(
//             'host'
//         )}/api/v1/users/reset-password/${resetToken}`;

//         // await new Email(user, resetUrl).sendPasswordReset();

//         res.status(200).json({
//             status: 'success',
//             message: 'Reset url is sent to your email'
//         });
//     } catch {
//         user.passwordResetToken = undefined;
//         user.resetTokenExpiresAt = undefined;
//         await user.save({ validateBeforeSave: false });

//         throw new ValidationError(
//             'Failure to send email. Try again later',
//             500
//         );
//     }
// };

// password reset
// exports.resetPassword = async (request, res, next) => {
//     const { resetToken } = request.params;
//     // check if token exist
//     if (!resetToken) {
//         throw new ValidationError('Invalid URL', 400);
//     }

//     // hash the token
//     const hashedToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');
//     // find user and check the token if it is expired
//     const user = await User.findOne({
//         passwordResetToken: hashedToken,
//         resetTokenExpiresAt: { $gt: Date.now() }
//     });
//     // if token has not expired, and user is valid then set new password
//     if (!user) {
//         throw new ValidationError('Token is invalid or expired', 400);
//     }

//     // set new password
//     user.password = request.body.password;
//     user.confirmPassword = request.body.confirmPassword;
//     user.passwordResetToken = undefined;
//     user.resetTokenExpiresAt = undefined;
//     user.save();
//     // login the user. send JWT
//     signAndSendToken(user, 200, res);
// };

// exports.updatePassword = async (request, res, next) => {
//     // user already logged in i.e. JWT verified
//     // console.log(req);
//     // get user from collection
//     const user = await User.findOne({ id: request.user.id }).select(
//         '+password'
//     );
//     // console.log(user);
//     // verify current password
//     const checkPass = await user.correctPassword(
//         request.body.currentPassword,
//         user.password
//     );
//     if (!checkPass) {
//         throw new ValidationError('Incorrect password', 401);
//     }

//     // set new password
//     user.password = request.body.password;
//     user.confirmPassword = request.body.confirmPassword;
//     await user.save();
//     // issue new jwt and send it
//     signAndSendToken(user, 200, res);
// };

// exports.facebook = async (req, res, next) => {
//     const { fb } = req.body;
//     const facebookId = fb.id;
//     const email = fb.email;

//     let user;
//     if (email) {
//         user = await User.findOne({ email });
//     } else {
//         user = await User.findOne({ facebookId });
//     }

//     // load new user data into the db
//     let newUser = user;
//     if (!user) {
//         newUser = await User.create({
//             name: fb.name,
//             email: fb.email,
//             password: facebookId,
//             confirmPassword: facebookId,
//             facebookId,
//         });
//     }

//     // send token
//     signAndSendToken(newUser, 201, res);
// };
