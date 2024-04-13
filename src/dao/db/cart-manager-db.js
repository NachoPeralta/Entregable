const CartModel = require("../../models/cart.model.js");

class CartManager {
    async createCart() {
        try {
            const newCart = CartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.log("Error al crear carrito", error);
        }
    }

    async getCartById(id) {
        try {
            const cart = await CartModel.findById(id);
            if (!cart) {
                console.log("Carrito no encontrado");
                return null;
            }
            return cart;
        } catch (error) {
            console.log("Error al traer el carrito", error);
        }
    }

    async updateCartProducts(id, products) {
        try {
            const cart = await CartModel.findByIdAndUpdate(id, { products: products }, { new: true });
            return cart;
        } catch (error) {
            console.log("Error al actualizar el carrito", error);
        }
    }

    async deleteCart(id) {
        try {
            const deletedCart = await CartModel.findByIdAndDelete(id);
            return deletedCart;
        } catch (error) {
            console.log(error);
        }
    }

    async addProductToCart(cart, product, quantity) {
        try {

            if (!cart) {
                console.log("Carrito no encontrado");
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
            console.log("Error al agregar producto al carrito", error);
        }
    }

    async getCarts() {
        try {
            const carts = await CartModel.find();
            return carts;
        } catch (error) {
            console.log("Error al traer los carritos", error);
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                console.log("Carrito no encontrado");
                return null;
            }

            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex === -1) {
                console.log("Producto no encontrado en el carrito");
                return null;
            }

            cart.products.splice(productIndex, 1);
            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            console.log("Error al eliminar producto del carrito", error);
        }
    }

    async emptyCart(cartId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                console.log("Carrito no encontrado");
                return null;
            }

            cart.products = [];
            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            console.log("Error al vaciar el carrito", error);
        }
    }
}

module.exports = CartManager;