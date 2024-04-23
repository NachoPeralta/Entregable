const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controller/userController");
const userController = new UserController();
const { generateToken } = require("../utils/jsonwebtoken.js");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);
router.get("/faillogin", userController.failLogin);
router.get("/failregister", userController.failRegister);

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

module.exports = router;