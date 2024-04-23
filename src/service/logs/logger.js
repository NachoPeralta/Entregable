const winston = require("winston");
const confiObj = require("../../config/config.js");
const env = confiObj;


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

const logger = env.mode === "prod" ? loggerProd : loggerDev;

//Middleware: 

const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = addLogger;