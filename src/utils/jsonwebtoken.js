const jwt = require('jsonwebtoken');
const confiObj = require("../config/config.js");
const env = confiObj;

const privateKey = env.secretWord;

const generateToken = (user) => {
    const token = jwt.sign(user, privateKey, {expiresIn: "2h"});

    return token;    
}

module.exports = { generateToken };