
const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/db/product-manager-db.js");
const productManager = new ProductManager();


// Devuelve todos los productos o la cantidad de productos que se le pase como limit
router.get("/", async (req, res) => {
    try {

        console.log("*** products.router req.query:" + req.query)
        console.log("*** products.router req.query.category:" + req.query.category)

        let limit = parseInt(req.query.limit) || 10;
        let page = parseInt(req.query.page) || 1;
        let category = req.query.category || "";
        let sort = req.query.sort || "asc";
        let title = "Listado de Productos"

        const products = await productManager.getProducts(limit, page, category, sort);

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

})

// Devuelve el producto dado un ID
router.get("/:pid", async (req, res) => {
    console.log("*** products.router req.params.pid:" + req.params.pid)
    const product = await productManager.getProductById(req.params.pid);

    if (product) {
        res.status(200).send({ status: "Success", product: product });
    } else {
        res.status(404).send({ message: "Product not found" })
    }
})

// Crea un producto nuevo y lo devuelve
router.post("/", async (req, res) => {
    try {
        const product = req.body;

        console.log("Producto Nuevo:" + product);

        const newProduct = await productManager.addProduct(product);
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
})


// Actualiza un producto y lo devuelve
router.put("/:pid", async (req, res) => {
    try {
        const product = req.body;
        const updatedProduct = await productManager.updateProduct(req.params.pid, product);
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
})

// Elimina un producto y devuelve la lista completa de productos
router.delete("/:pid", async (req, res) => {
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
})




module.exports = router;