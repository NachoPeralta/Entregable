const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/db/product-manager-db");
const productManager = new ProductManager();

router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts");
    } catch (error) {
        res.send({ status: "error", error: error.message });
        console.log(error);
        return;
    }
})

router.get("/chat", async (req, res) => {
    res.render("chat");
})

// Ruta para el formulario de login
router.get("/", (req, res) => {
    // Verifica si el usuario ya está logueado y redirige a la página de perfil si es así
    if (req.session.login) {
        return res.redirect("/products");
    }

    res.render("login");
});

// Ruta para el formulario de registro
router.get("/register", (req, res) => {
    // Verifica si el usuario ya está logueado y redirige a la página de perfil si es así
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register");
});

// Ruta para la vista de perfil
router.get("/profile", (req, res) => {
    // Verifica si el usuario está logueado
    if (!req.session.login) {
        // Redirige al formulario de login si no está logueado
        return res.redirect("/");
    }

    // Renderiza la vista de perfil con los datos del usuario
    res.render("profile", { user: req.session.user });
});

module.exports = router; 