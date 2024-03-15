const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/", passport.authenticate("register", {
    failureRedirect: "/failedregister"
}), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: "error", message: "Credenciales invalidas" });

    req.session.user = req.user;
    req.session.login = true;

    res.redirect("/api/products");
})

router.get("/api/users/failedregister", (req, res) => {
    res.send({ error: "Registro fallido, verifique credenciales" });
})

module.exports = router; 