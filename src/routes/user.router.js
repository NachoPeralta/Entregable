const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controller/userController");
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);
router.get("/faillogin", userController.failLogin);
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

module.exports = router;