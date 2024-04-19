
class CustomError {
    static createError({name = "Error", cause = "desconcido", message, code = 1}) {
        const error = new Error(message);
        error.name = name;
        error.cause = cause;
        error.code = code;        
        return error;
    }
}

module.exports = CustomError;