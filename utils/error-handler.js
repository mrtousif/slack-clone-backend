const AppError = require('./AppError');

const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
    const errorMessages = Object.values(error.errors).map(
        (element) => element.message
    );
    const message = `Invalid input data. ${errorMessages.join('. ')}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = (error) => {
    const message = `Duplicate field value name: ${error.keyValue.name}`;
    // const msg = err.errmsg.match(/(['"])((\\\1|.)*?)\1/gm);
    // const msg = err.errmsg.match(/"([^"]*)"/);
    // const message = `Duplicate field value name: ${msg}`;
    return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
    return new AppError('Invalid token. Please log in again', 401);
};

const handleTokenExpiredError = () => {
    return new AppError('Expired token. Please log in again', 401);
};

const sendErrorDev = (error, request, response) => {
    // a) if request url starts with /graphql

    if (request.originalUrl.startsWith('/graphql')) {
        return response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            error,
            stack: error.stack
        });
    }

    // b) render error page
    response.status(error.statusCode).render('error', {
        title: 'Something went wrong',
        message: error.message
    });
};

const sendErrorProd = (error, request, response) => {
    // log the error to the console
    console.error('PRODUCTION ERROR:', error);
    console.log(
        'starts_with_/graphql:',
        request.originalUrl.startsWith('/graphql')
    );
    // a) if request url starts with /graphql
    if (request.originalUrl.startsWith('/graphql')) {
        // operational, trusted errors to the client
        if (error.isOperational) {
            return response.status(error.statusCode).json({
                status: error.status,
                message: error.message
            });
        }

        // programming errors or unknown errors, do not leak
        // send generic error to the client
        return response.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }

    // b) request url does not starts with /graphql
    // if error is operational, render the message to the client
    if (error.isOperational) {
        return response.status(error.statusCode).render('error', {
            title: 'Something went wrong',
            message: error.message
        });
    }

    // error is not operational
    // render error page with generic message
    response.status(error.statusCode).render('error', {
        title: 'Something went wrong',
        message: 'Please try again later'
    });
};

// global error handler using expresponses middleware
// called from catchAsync()
module.exports = (error_, request, response, _next) => {
    // console.log(err.stack);
    error_.statusCode = error_.statusCode || 500;
    error_.status = error_.status || 'error';

    if (process.env.NODE_ENV === 'production') {
        // errors for production
        let error = { ...error_ };
        error.message = error_.message;

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        } else if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        } else if (error.code === 11000) {
            error = handleDuplicateFieldsErrorDB(error);
        } else if (error.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError();
        } else if (error.name === 'TokenExpiredError') {
            error = handleTokenExpiredError();
        }

        // production error
        sendErrorProd(error, request, response);
    } else {
        // errors for development
        sendErrorDev(error_, request, response);
    }
};
