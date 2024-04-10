const jwt = require('jsonwebtoken');
const confiObj = require("../config/config.js");
const env = confiObj;

const checkUserRole = (allowedRoles) => (req, res, next) => {
    const token = req.cookies.coderCookieToken;
    
    if (token) {
        jwt.verify(token, env.secretWord, (err, decoded) => {
            if (err) {
                res.clearCookie('coderCookieToken');
                res.status(403).send('Acceso denegado. Token inválido.');
            } else {
                const userRole = decoded.user.role;
                if (allowedRoles.includes(userRole)) {
                    next();
                } else {
                    res.status(403).send('Acceso denegado. No tienes permiso para acceder a esta página.');
                }
            }
        });
    } else {
        res.status(403).send('Acceso denegado. Token no proporcionado.');
    }
};

module.exports = checkUserRole;