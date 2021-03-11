// for marking known errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // operational errors are known or trusted errors that are marked as errors by us
        this.isOperational = true;
        // error stack
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
