const express = require("express");
const router = express.Router();

const CartController = require("../controller/cartController.js");
const cartController = new CartController();

const passport = require('passport');


// Devuelve todos los carritos
router.get("/", cartController.getCarts);

// Devuelve un carrito dado su ID
router.get("/:cid", cartController.getCartById);

// Crea un carrito y lo devuelve
router.post("/", cartController.createCart);

// Agrega un producto al carrito dado su ID de carrito y producto.
router.post("/:cid/products/:pid", cartController.addProductToCart);

// Elimina todos los productos del carrito dado su ID.
router.delete("/:cid", cartController.emptyCart);

// Elimina un producto del carrito dado su ID de carrito y producto.
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);

// Actualiza los productos del carrito dado su ID.
router.put('/:cid', cartController.updateCartProducts);

// Actualiza cantidades de productos en el carrito. Si el producto no existe en el mismo lo agrega.
router.put('/:cid/product/:pid', cartController.updateProductQuantity);

router.post('/:cid/purchase', passport.authenticate('jwt', { session: false }), cartController.endPurchase);


module.exports = router;