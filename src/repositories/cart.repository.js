const CartManager = require("../dao/db/cart-manager-db.js");
const dbCartManager = new CartManager();

const ProductManager = require("../dao/db/product-manager-db.js");
const dbProductManager = new ProductManager();

class CartRepository {

    async getCarts() {
        const carts = await dbCartManager.getCarts();
        return carts;
    }

    async getCartById(cid) {
        const cart = await dbCartManager.getCartById(cid);
        return cart;
    }

    async createCart() {
        const cart = await dbCartManager.createCart();
        return cart;
    }

    async addProductToCart(cart, product, quantity) {        
        const cartAdded = dbCartManager.addProductToCart(cart, product, quantity);
        return cartAdded;
    }

    async emptyCart(cid) {
        const cart = dbCartManager.emptyCart(cid);
        return cart;
    }

    async deleteProductFromCart(cid, pid){
        const cart = dbCartManager.deleteProductFromCart(cid, pid);
        return cart;        
    }

    async updateCartProducts(cartId, updatedProducts){
        const cart = dbCartManager.updateCartProducts(cartId, updatedProducts);
        return cart;
    }
    
}

module.exports = CartRepository;