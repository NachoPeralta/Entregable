const CartModel = require("../../models/cart.model.js");

class CartManager {
    async createCart() {
        try {
            const newCart = CartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            req.logger.error("Error al crear carrito. ",error);
        }
    }

    async getCartById(id) {
        try {
            const cart = await CartModel.findById(id);
            if (!cart) {
                req.logger.warning("Carrito no encontrado.");
                return null;
            }
            return cart;
        } catch (error) {
            req.logger.error("Error al traer el carrito. ",error); 
        }
    }

    async updateCartProducts(id, products) {
        try {
            const cart = await CartModel.findByIdAndUpdate(id, { products: products }, { new: true });
            return cart;
        } catch (error) {
            req.logger.error("Error al actualizar el carrito. ",error); 
        }
    }

    async deleteCart(id) {
        try {
            const deletedCart = await CartModel.findByIdAndDelete(id);
            return deletedCart;
        } catch (error) {
            req.logger.error("Error al eliminar el carrito. ", error);
        }
    }

    async addProductToCart(cart, product, quantity) {
        try {

            if (!cart) {
                req.logger.info("Carrito no encontrado"); 
                return null;
            }

            const productExist = cart.products.find(prod => prod.product.id == product.id);
            // Cambio el tipo de dato de la cantidad a entero para que no se agregue como texto
            quantity = parseInt(quantity);

            if (productExist) {
                productExist.quantity += quantity;
            } else {
                cart.products.push({
                    product: product,
                    quantity: quantity
                });
            }

            cart.markModified('products');
            await cart.save();
            return cart;

        } catch (error) {
            req.logger.error("Error al agregar producto al carrito. ", error);
            return null;
        }
    }

    async getCarts() {
        try {
            const carts = await CartModel.find();
            return carts;
        } catch (error) {
            req.logger.error("Error al traer los carritos. ", error);
            return null;
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                req.logger.info("Carrito no encontrado");
                return null;
            }

            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex === -1) {
                req.logger.info("Producto no encontrado en el carrito");
                return null;
            }

            cart.products.splice(productIndex, 1);
            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            req.logger.error("Error al eliminar producto del carrito. ", error);
            return null;
        }
    }

    async emptyCart(cartId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                req.logger.info("Carrito no encontrado");
                return null;
            }

            cart.products = [];
            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            req.logger.error("Error al vaciar el carrito. ", error);
            return null;
        }
    }
}

module.exports = CartManager;