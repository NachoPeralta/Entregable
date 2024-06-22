
const ProductRepository = require("../repositories/product.repository");
const productRepository = new ProductRepository();
const logger = require("../service/logs/logger.js");
const EmailManager = require("../service/email.js");
const emailManager = new EmailManager();
const UserModel = require("../models/user.model.js");

class ProductController {

    async getProducts(req, res) {
        try {
            
            let limit = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            let category = req.query.category || "";
            let sort = req.query.sort || "asc";
            let title = "Listado de Productos"

            const products = await productRepository.getProducts(limit, page, category, sort);

            if (!products) {
                res.status(404).send({ status: "error", error: "No se encontraron productos" });
                return;
            }

            const result = products.docs.map(product => {
                const { ...rest } = product;
                return rest;
            });

            res.status(200).send({
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
                first_name: req.user ? req.user.first_name : null,
                last_name: req.user ? req.user.last_name : null,
                age: req.user ? req.user.age : null,
                email: req.user ? req.user.email : null,
                cartId: req.user ? req.user.cartId : null,
                role: req.user ? req.user.role : null
            });

        } catch (error) {
            logger.error("Error al traer los productos. ",error);
            res.status(401).send({ status: "error", error: "Error al traer los productos. " + error });
        }
    }

    async getProductById(req, res) {
        const product = await productRepository.getProductById(req.params.pid);

        if (product) {
            res.status(200).send({ status: "Success", product: product });
        } else {
            res.status(404).send({ message: "Product not found" })
        }
    }

    async addProduct(reqOrProduct, res = null) {
        try {
            const product = typeof reqOrProduct === 'object' && !reqOrProduct.params ? reqOrProduct : reqOrProduct.body;
            const newProduct = await productRepository.addProduct(product);
            
            if (!newProduct) {
                if (res) {
                    res.status(400).send({ status: "Error", error: "No se pudo agregar el producto, verifique los datos ingresados" });
                }
                return;
            }

            if (res) {
                res.status(201).send({ status: "Success", product: newProduct });
            }
        } catch (error) {
            logger.error("No se pudo agregar el producto. ", error);
            if (res) {
                res.status(401).send({ status: "Error", error: "No se pudo agregar el producto" });
            }
        }
    }

    async updateProduct(req, res) {

        try {
            const product = req.body;
            const updatedProduct = await productRepository.updateProduct(req.params.pid, product);
            if (!updatedProduct) {
                res.status(404).send({ status: "Error", error: "Producto no encontrado" });
                return;
            }
            res.status(200).send({ status: "Success", product: { updatedProduct } });

        } catch (error) {
            logger.error("No se pudo actualizar el producto. ",error); 
            res.status(401).send({ status: "Error", error: "No se pudo actualizar el producto" });
            return;
        }
    }

    async deleteProduct(reqOrPid, res = null) {
        try {
            const productId = typeof reqOrPid === 'string' ? reqOrPid : reqOrPid.params.pid;
            const deletedProduct = await productRepository.deleteProduct(productId);

            if (!deletedProduct) {
                if (res) {
                    res.status(404).send({ status: "Error", error: "Producto no encontrado" });
                }
                return;
            }

            const ownerEmail = deletedProduct.owner;
            const owner = await UserModel.findOne({ email: ownerEmail });

            if (owner && owner.role === 'premium') {
                await emailManager.sendNotificationEmail(
                    owner.email,
                    owner.first_name,
                    "Producto eliminado",
                    `Tu producto "${deletedProduct.title}" ha sido eliminado de la tienda.`
                );
            }

            if (res) {
                res.status(200).send({ status: "Success", deletedProduct: deletedProduct });
            }

        } catch (error) {
            logger.error("No se pudo eliminar el producto. ", error);
            if (res) {
                res.status(401).send({ status: "Error", error: "No se pudo eliminar el producto" });
            }
        }
    }

    async generateProducts(req, res) {
        try {
            logger.info("Generando Productos de prueba... "); 

            let products = [];

            for (let i = 0; i < 100; i++) {
                let p = await productRepository.generateProduct()                
                products.push(p);
            }

            res.status(200).send({ status: "Success", products: products });

        } catch (error) {
            logger.error("No se pudo generar los productos. ",error); 
            res.status(401).send({ status: "Error", error: "No se pudo generar los productos" });
            return;
        }
    }

}

module.exports = ProductController;