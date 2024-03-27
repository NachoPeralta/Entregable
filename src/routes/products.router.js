
const express = require("express");
const router = express.Router();

const ProductController = require("../controller/productController.js");
const productController = new ProductController();


// Devuelve todos los productos o la cantidad de productos que se le pase como limit
router.get("/", productController.getProducts);


// Devuelve el producto dado un ID
router.get("/:pid", productController.getProductById);


// Crea un producto nuevo y lo devuelve
router.post("/", productController.addProduct);



// Actualiza un producto y lo devuelve
router.put("/:pid", productController.updateProduct);


// Elimina un producto y devuelve la lista completa de productos
router.delete("/:pid", productController.deleteProduct);






module.exports = router;