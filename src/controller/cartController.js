const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();

const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();

class CartController {

    async getCarts(req, res) {
        try {
            const carts = await cartRepository.getCarts();
            res.status(200).send({ status: "success", cart: carts });
        } catch (error) {
            console.log(error);
            res.status(401).send({ status: "error", error: "No se pudieron cargar los carritos" });
        }
    }

    async getCartById(req, res) {
        try {
            const cart = await cartRepository.getCartById(req.params.cid);

            if (cart) {
                res.render("cart", {
                    status: "success",
                    cart: cart,
                    products: cart.products,
                    title: "Carrito",
                    cartInfo: "Esto es un Carrito"
                });
            } else {
                res.status(404).send({ status: "Error", error: "Carrito no encontrado" });
            }
        } catch (error) {
            console.log(error);
            res.status(401).send({ status: "Error", error: "No se pudo cargar el carrito" });
        }
    }

    async createCart(req, res) {
        try {
            const cart = await cartRepository.createCart();
            res.status(201).send({ status: "Success", cart: cart });
        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo crear el carrito" });
            console.log(error);
            return;
        }
    }

    async addProductToCart(req, res) {
        try {
            let cart = await cartRepository.getCartById(req.params.cid);
            if (!cart) {
                res.status(404).send({ status: "Error", error: "Carrito no encontrado" });
                return;
            }

            const product = await productRepository.getProductById(req.params.pid);
            if (!product) {
                res.status(404).send({ status: "Error", error: "Producto no encontrado" });
                return;
            }

            const { quantity } = req.body;
            
            cart = await cartRepository.addProductToCart(cart, product, quantity);
            if (!cart) {
                res.status(404).send({ status: "Error", error: "No se pudo agregar el producto al carrito" });
                return;
            }
            res.status(200).status(200).send({ status: "Success", cart: cart });

        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo agregar el producto al carrito" });
            console.log(error);
            return;
        }
    }

    async emptyCart(req, res) {
        try {
            const cart = await cartRepository.emptyCart(req.params.cid);
            if (!cart) {
                res.status(404).send({ status: "Error", error: "Carrito no encontrado" });
                return;
            }
            res.status(200).send({ status: "Success", cart: cart });
        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo eliminar el carrito" });
            console.log(error);
            return;
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            let cart = await cartRepository.getCartById(req.params.cid);
            if (!cart) {
                res.status(404).send({ status: "Error", error: "Carrito no encontrado" });
                return;
            }

            cart = await cartRepository.deleteProductFromCart(req.params.cid, req.params.pid);
            if (!cart) {
                res.status(401).send({ status: "Error", error: "Error al eliminar productos en el carrito" });
                return;
            }
            res.status(200).send({ status: "Success", cart: cart });

        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo eliminar el producto del carrito" });
            console.log(error);
            return;
        }
    }

    async updateCartProducts(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        if (!updatedProducts || !Array.isArray(updatedProducts)) {
            return res.status(400).json({ error: 'Formato de productos desconocido' });
        }
        if (cartId === 'undefined') return res.status(400).json({ error: 'El ID del carrito es requerido' });

        try {
            const updatedCart = await cartRepository.updateCartProducts(cartId, updatedProducts);
            if (!updatedCart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            res.status(200).json({ status: "Success", message: "Carrito actualizado correctamente", updatedCart });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: 'Error interno del servidor',
            });
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const newQuantity = req.body.quantity;

            if (!newQuantity || isNaN(newQuantity) || newQuantity < 0) return res.status(400).json({ error: 'La cantidad debe ser un número mayor a cero' });
            if (cartId === 'undefined') return res.status(400).json({ error: 'El ID del carrito es requerido' });
            if (productId === 'undefined') return res.status(400).json({ error: 'El ID del producto es requerido' });

            const cart = await cartRepository.getCartById(cartId);
            if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

            const product = await productRepository.getProductById(productId);
            if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

            const updatedCart = await cartRepository.addProductToCart(cartId, productId, newQuantity);

            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: 'Error interno del servidor',
            });
        }
    }
}


module.exports = CartController;