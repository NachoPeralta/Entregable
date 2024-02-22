const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/db/product-manager-db");
const productManager = new ProductManager();

// router.get("/", async (req, res) => {
//     try {
//         const products = await productManager.getProducts();
//         const title = "Listado de Productos"
//         res.render("index", { products, title });
//     } catch (error) {
//         res.send({ status: "error", error: error.message });
//         console.log(error);
//         return;
//     }
// })

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

module.exports = router; 