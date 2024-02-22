const fs = require("fs").promises;

class ProductManager {
    static lastId = 0;

    constructor(path) {
        this.path = path;
        this.products = path ? this.readFile().then(data => data ?? []) : [];
    }

    async addProduct(newProduct) {
        this.lastId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) : this.lastId;

        let { title, description, code, price, status, stock, category, thumbnail } = newProduct;

        if (!title || !description || !code || !price || !status || !stock || !category) {
            console.log("Los datos no pueden estar vacios");
            return;
        }
        if (this.products.some(item => item.code === code)) {
            console.log("El codigo de producto ya existe");
            return;
        }

        const product = {
            id: ++this.lastId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnail
        }

        this.products.push(product);
        return await this.saveFile();
    }

    async getProducts() {
        await this.readFile();
        return this.products;
    }

    async getProductById(id) {
        await this.readFile();
        const product = this.products.find(item => item.id == id);

        if (!product) {
            return;
        }
        return product;
    }

    async readFile() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            this.products = JSON.parse(data);

        } catch (error) {
            console.log("Error al leer archivo:", error);
        }
    }

    async saveFile() {
        try {
            const data = JSON.stringify(this.products, null, 2);
            await fs.writeFile(this.path, data);
            console.log("Producto Guardado");
            return data;

        } catch (error) {
            console.log("Error al guardar producto:", error);
            return error;
        }

    }

    async updateProduct(id, newData) {
        try {
            await this.readFile();
            const index = this.products.findIndex(item => item.id == id);

            if (index === -1) {
                console.log("Producto no encontrado");
                return;
            }

            const product = this.products[index];
            const updatedProduct = { ...product, ...newData };
            this.products[index] = updatedProduct;
            await this.saveFile();
            return updatedProduct;

        } catch (error) {
            console.log("Error al actualizar producto:", error);
            return error;
        }
    }

    async deleteProduct(id) {
        try {
            await this.readFile();
            const index = this.products.findIndex(item => item.id == id);

            if (index === -1) {
                console.log("Producto no encontrado");
                return;
            }

            this.products.splice(index, 1);
            await this.saveFile();
            return this.products;
        } catch (error) {
            console.log("Error al eliminar producto:", error);
            return error;
        }
    }

}


module.exports = ProductManager;