const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isValidPassword, createHash } = require("../utils/hashBcrypt");
const generateToken = require("../utils/jsonwebtoken");
const userModel = require("../models/user.model.js");


router.post("/login", passport.authenticate("login", {failureRedirect: "/api/sessions/faillogin"}), async (req, res) => {
    
    if(!req.user) res.status(400).redirect("/faillogin");

    req.session.user = req.user;

    req.session.login = true;

    res.redirect("/api/products");
})

router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/");
})

router.get("/faillogin", async (req, res ) => {
        
    res.render("error", {
            error: "Error en el login",
            message: "Verifique sus credenciales o ingrese al registro de usuario"
        });
})

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async (req, res) => {
    res.send("Login con github");
});

router.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/login"}), async (req, res) => {
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role
    };

    req.session.login = true;

    res.redirect("/api/products");
});

router.post("/register", async (req, res) => {
    const { first_name, last_name, age, email, password } = req.body;
    try {
        const user = await req.userModel.findOne({ email: email });
        if (user) {
            return res.status(400).send({ status: "error", message: "El usuario ya existe" });
        }

        const newUser = await req.userModel.create({ first_name, last_name, age, email, password: createHash(password) });

        const token = generateToken({ id: newUser._id });

        res.status(200).send({ status: "success", message:"Usuario creado con éxito", payload: newUser, token });

    } catch (error) {
        console.log("Error al registrar", error);
        res.status(500).send({ error: "Error en el servidor al registrar" });
    }
});

router.get("/current", async (req, res) => {
    // Verifica si el usuario está autenticado
    if (req.isAuthenticated()) {
        // Si el usuario está autenticado, devolver el usuario actual
        res.status(200).json({ user: req.user });
    } else {
        // Si el usuario no está autenticado, devolver un mensaje de error
        res.status(401).json({ error: "Usuario no autenticado" });
    }
});


module.exports = router;