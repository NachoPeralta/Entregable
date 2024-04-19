const { Errors } = require("../service/errors/enums.js");

const errorHandler = (error, req, res, next) => {
    console.log("***ERROR_HANDLER" + error.cause);

    switch (error.code) {
        case Errors.PATH_ERROR:
            res.send({ status: "error", error: error.name })
            break;
        case Errors.INVALID_TYPE:
            res.send({ status: "error", error: error.name })
            break;
        case Errors.BD_ERROR:
            res.send({ status: "error", error: error.name })
            break;
        case Errors.INVALID_CREDENCIALS:
            console.log("***INVALID_CREDENCIALS cause:" + error.cause);
            res.send({ status: "error", error: error.name })
            break;
        case Errors.EMAIL_EXISTS:
            console.log("***EMAIL_EXISTS cause:" + error.cause);
            res.send({ status: "error", error: error.name })
            break;
        default:
            res.send({ status: "error", error: "Error desconocido" })
    }
}


module.exports = errorHandler;