const ProductManager = require("../dao/db/product-manager-db.js");
const dbProductManager = new ProductManager();
const { faker } = require("@faker-js/faker");

class ProductRepository {

    async getProducts(limit, page, category, sort, owner, tienda) {

        const products = await dbProductManager.getProducts(limit, page, category, sort, owner, tienda);
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

    async generateProduct() {
        return {
            id: faker.database.mongodbObjectId(),
            title: faker.commerce.productName(),
            price: faker.commerce.price(),
            code: faker.commerce.isbn(),
            stock: parseInt(faker.string.numeric()),
            description: faker.commerce.productDescription(),
            image: faker.image.url()
        }
    }

}

module.exports = ProductRepository;