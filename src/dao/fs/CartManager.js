const fs = require("fs").promises;

class CartManager {
    static lastCartId = 0;

    constructor(path) {
        this.path = path;
        this.carts = path ? this.readFile() : [];
    }

    async getCarts() {
        await this.readFile();
        return this.carts;        
    }

    async readFile() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            this.carts = JSON.parse(data);

            return this.carts;

        } catch (error) {
            console.error("Error al leer Carts.json:", error);
            return [];
        }    
    }

    async createCart() {
        this.lastCartId =  this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) : 0;
        
        const newCart = {
            id: ++this.lastCartId,
            products: []
        };

        this.carts.push(newCart);
        await this.saveFile();

        return newCart;    
    }

    async saveFile() {
        await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        return this.carts;    
    }

    async getCartById(id) {
        await this.getCarts();
        const cart = this.carts.find(item => item.id == id);
    
        if (!cart) {
            return {error: "Carrito no encontrado"};
        }
        return cart;
    }
    

    async addProductToCart(cart, product, quantity = 1) {    
        
        const productIndex = cart.products.findIndex(item => item.productId == product.id);
    
        if (productIndex !== -1) {
            // Si el producto ya existe en el carrito, actualizo la cantidad
            cart.products[productIndex].quantity += quantity;
        } else {
            // Si el producto no existe, lo agrego al carrito
            cart.products.push({
                productId: product.id,
                quantity: quantity
            });
        }
    
        await this.saveFile();
        return cart;
    }
    

}

module.exports = CartManager;