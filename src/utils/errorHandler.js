const { Errors } = require("../service/errors/enums.js");

const errorHandler = (error, req, res, next) => {
    
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
            res.send({ status: "error", error: error.name })
            break;
        case Errors.EMAIL_EXISTS:
            res.send({ status: "error", error: error.name })
            break;
        default:
            res.send({ status: "error", error: "Error desconocido" })
    }
}


module.exports = errorHandler;