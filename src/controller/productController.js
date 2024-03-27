
const ProductService = require("../service/productService.js");
const productService = new ProductService();

class ProductController {

    async getProducts(req, res) {
        try {
            let limit = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            let category = req.query.category || "";
            let sort = req.query.sort || "asc";
            let title = "Listado de Productos"

            const products = await productService.getProducts(limit, page, category, sort);

            if (!products) {
                res.status(404).send({ status: "error", error: "No se encontraron productos" });
                return;
            }

            const result = products.docs.map(product => {
                const { _id, ...rest } = product;
                return rest;
            });

            res.render("index", {
                status: "success",
                payload: result,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                currentPage: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
                nextLink: products.hasNextPage ? `/products?page=${products.nextPage}` : null,
                limit: limit,
                page: page,
                category: category,
                title: title,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                age: req.user.age,
                email: req.user.email,
                role: req.user.role
            });

        } catch (error) {
            console.log("Error al traer los productos", error);
            res.status(401).send({ status: "error", error: "Error al traer los productos" });
        }
    }

    async getProductById(req, res) {
        const product = await productService.getProductById(req.params.pid);

        if (product) {
            res.status(200).send({ status: "Success", product: product });
        } else {
            res.status(404).send({ message: "Product not found" })
        }
    }

    async addProduct(req, res) {
        try {
            const product = req.body;

            console.log("Producto Nuevo:" + product);

            const newProduct = await productService.addProduct(product);
            if (!newProduct) {
                res.status(400).send({ status: "Error", error: "No se pudo agregar el producto, verifique los datos ingresados" });
                return;
            }
            res.status(201).send({ status: "Success", product: { newProduct } });

        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo agregar el producto" });
            console.log(error);
            return;
        }
    }

    async updateProduct(req, res) {

        try {
            const product = req.body;
            const updatedProduct = await productService.updateProduct(req.params.pid, product);
            if (!updatedProduct) {
                res.status(404).send({ status: "Error", error: "Producto no encontrado" });
                return;
            }
            res.status(200).send({ status: "Success", product: { updatedProduct } });

        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo actualizar el producto" });
            console.log(error);
            return;
        }
    }

    async deleteProduct(req, res) {
        try {
            const products = await productManager.deleteProduct(req.params.pid);
            if (!products) {
                res.status(404).send({ status: "Error", error: "Producto no encontrado" });
                return;
            }
            res.status(200).send({ status: "Success", products: products });
        } catch (error) {
            res.status(401).send({ status: "Error", error: "No se pudo eliminar el producto" });
            console.log(error);
            return;
        }
    }

}

module.exports = ProductController;