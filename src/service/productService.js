const ProductManager = require("../dao/db/product-manager-db.js");
const dbProductManager = new ProductManager();


class ProductService {

    async getProducts(limit, page, category, sort) {

        const products = await dbProductManager.getProducts(limit, page, category, sort);
        return products;
    }

    async getProductById(id) {
        const product = await dbProductManager.getProductById(id);
        return product;
    }

    async addProduct(product) {
        const newProduct = await dbProductManager.addProduct(product);
        return newProduct;
    }

    async updateProduct(id, product) {
        const updatedProduct = await dbProductManager.updateProduct(id, product);
        return updatedProduct;
    }

    async deleteProduct(id) {
        const deletedProduct = await dbProductManager.deleteProduct(id);
        return deletedProduct;
    }

}

module.exports = ProductService;