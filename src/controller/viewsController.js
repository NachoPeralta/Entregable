const ProductModel = require("../models/products.model.js");
const CartService = require("../service/cartService.js");
const cartService = new CartService();
const ProductService = require("../service/productService.js");
const productService = new ProductService();

class ViewsController {
    async renderProducts(req, res) {
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

    async renderCart(req, res) {
        const cartId = req.params.cid;
        try {
            const carrito = await cartService.getCartById(cartId);

            if (!carrito) {
                console.log("No existe ese carrito con el id");
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const productosEnCarrito = carrito.products.map(item => ({
                product: item.product.toObject(),
                quantity: item.quantity
            }));


            res.render("carts", { productos: productosEnCarrito });
        } catch (error) {
            console.error("Error al obtener el carrito", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderLogin(req, res) {
        res.render("login");
    }

    async renderRegister(req, res) {
        res.render("register");
    }

    async renderRealTimeProducts(req, res) {
        try {
            res.render("realtimeproducts");
        } catch (error) {
            console.log("error en la vista real time", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderChat(req, res) {
        res.render("chat");
    }

    async renderHome(req, res) {
        res.render("home");
    }
}

module.exports = ViewsController;