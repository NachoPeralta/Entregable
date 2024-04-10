const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/db/product-manager-db");
const productManager = new ProductManager();
const ViewsController = require("../controller/viewsController.js");
const viewsController = new ViewsController();
const checkUserRole = require("../utils/checkrole.js");
const passport = require("passport");

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
    // Verifica si el usuario ya está logueado y redirige a la página de productos
    if (req.session.login) {
        return res.redirect("/products");
    }

    res.render("login");
});

// Ruta para el formulario de registro
router.get("/register", (req, res) => {
    // Verifica si el usuario ya está logueado y redirige a la página de perfil
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


router.get("/products", checkUserRole(['usuario']),passport.authenticate('jwt', { session: false }), viewsController.renderProducts(viewsController));



module.exports = router; 