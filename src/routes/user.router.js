const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controller/userController");
const userController = new UserController();
const { generateToken } = require("../utils/jsonwebtoken.js");

// Registro de Usuario
router.post("/register", userController.register);

// Login de Usuario
router.post("/login", userController.login);

// Logout de Usuario
router.post("/logout", userController.logout.bind(userController));

// Perfil de Usuario
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);

// Usuario Administrador
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);

// Error en Login de Usuario
router.get("/faillogin", userController.failLogin);

// Error en Registro de Usuario
router.get("/failregister", userController.failRegister);

// Request para restablecer contraseña
router.post("/requestPasswordReset", userController.requestPasswordReset);

// Reset password
router.post('/reset-password', userController.resetPassword);

// Login con gitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {
    res.send("Login con github");
});
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role
    };

    req.login = true;

    const token = generateToken({ user: req.user });
    res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true
    });

    userController.profile(req, res);
});

// Cambio de rol a premium
router.post("/premium/:uid", userController.changeRoleToPremium);


module.exports = router;