const winston = require("winston");

const levels = {
    level: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}

const loggerProd = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.Console({
            level: "info", 
            format: winston.format.combine(
                winston.format.colorize({colors: levels.colors}), 
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./ecommerceLogs.log", 
            level: "warning",
            format: winston.format.simple()
        })
    ]
})
const loggerDev = winston.createLogger({
    levels: levels.level,
    transports: [
        new winston.transports.Console({
            level: "debug", 
            format: winston.format.combine(
                winston.format.colorize({colors: levels.colors}), 
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: "./ecommerceLogs.log", 
            level: "warning",
            format: winston.format.simple()
        })
    ]
})


//Middleware: 

const addLoggerProd = (req, res, next) => {
    req.logger = loggerProd;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}
const addLoggerDev = (req, res, next) => {
    req.logger = loggerDev;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = {addLoggerProd, addLoggerDev};