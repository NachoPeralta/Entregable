const dotenv = require("dotenv");
const program = require("../utils/commander.js");

const {mode} = program.opts();

dotenv.config({
    path: mode === "prod" ? "./.env.prod" : "./.env.dev"
});

const confiObj = {
    mongoUrl: process.env.MONGO_URL,
    secretWord: process.env.SECRET_WORD,
    port: process.env.PORT,
    mode: process.env.MODE
}


module.exports = confiObj;