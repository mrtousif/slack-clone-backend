// catch async errors
const catchAsync = (func) => {
    return (request, response, next) => {
        func(request, response, next).catch(next); // err => next(err)
        // if there is error. err object is sent straight to the global errorController
    };
};

module.exports = catchAsync;
