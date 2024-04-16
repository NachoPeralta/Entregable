const express = require("express");
const router = express.Router();

const ProductController = require("../controller/productController.js");
const productController = new ProductController();


// Genera 100 productos y los devuelve utilizando faker
router.get("/mockingproducts", productController.generateProducts);

module.exports = router;