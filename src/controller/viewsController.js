const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const TicketRepository = require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();
const UserModel = require("../models/user.model.js");

class ViewsController {
    async renderProducts(req, res) {
        try {
            let limit = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            let category = req.query.category || "";
            let sort = req.query.sort || "asc";
            let title = "Listado de Productos"

            const products = await productRepository.getProducts(limit, page, category, sort);

            if (!products) {
                req.logger.info("No se encontraron productos",info);
                res.status(404).send({ status: "error", error: "No se encontraron productos" });
                return;
            }

            const result = products.docs.map(product => {
                const { ...rest } = product;
                return rest;
            });


            res.render("products", {
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
                cartId: req.user ? req.user.cart : null,
                role: req.user ? req.user.role : null
            });

        } catch (error) {
            req.logger.error("Error al traer los productos",error); 
            res.status(401).send({ status: "error", error: "Error al traer los productos" });
        }
    }

    async renderCart(req, res) {
        const cartId = req.params.cid;
        const title = "Carrito";
        const cartInfo = "Aquí tienes toda la información de tu Carrito";

        try {
            const cart = await cartRepository.getCartById(cartId);

            if (!cart) {
                req.logger.info("Carrito no encontrado.",info);
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            let totalBuy = 0;

            const cartProducts = cart.products.map(item => {
                const product = item.product ? item.product.toObject() : null;
                const quantity = item.quantity;
                const totalPrice =( product ? product.price : 0 ) * quantity;
                
                totalBuy += totalPrice;

                return {
                    product: { ...product, totalPrice },
                    quantity,
                    cartId
                };
            });

            res.render("cart", { 
                products: cartProducts, 
                totalBuy, 
                cartId, 
                title, 
                cartInfo,
                hasTicket: false });

        } catch (error) {
            req.logger.error("Error del servidor al obtener el carrito",error); 
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
            let limit = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            let sort = req.query.sort || "asc";
            let title = "Listado de Productos"

            const products = await productRepository.getProducts(limit, page, null, sort);

            if (!products) {
                res.status(404).send({ status: "error", error: "No se encontraron productos" });
                return;
            }

            const result = products.docs.map(product => {
                const { ...rest } = product;
                return rest;
            });
    
            res.render("realtimeproducts", {
                products: result,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                currentPage: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/realtimeproducts?page=${products.prevPage}` : null,
                nextLink: products.hasNextPage ? `/realtimeproducts?page=${products.nextPage}` : null,
                limit: limit,
                page: page,                
                title,
                first_name: req.user ? req.user.first_name : null,
                last_name: req.user ? req.user.last_name : null,
                role: req.user ? req.user.role : null,                
            });
    
        } catch (error) {            
            req.logger.error("Error en la vista de productos en tiempo real. ",error); 
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
    

    async renderChat(req, res) {
        res.render("chat");
    }

    async renderHome(req, res) {
        res.render("home");
    }

    async renderPurchase(req, res) {
        try {
            const cart = await cartRepository.getCartById(req.params.cid);
            const ticket = await ticketRepository.getTicketById(req.params.tid);
            const purchaser = await UserModel.findById(ticket.purchaser);
            const products = cart.products;
            const cartInfo = "Productos pendientes de compra. Momentaneamente sin stock";
            const title = "Compra Finalizada";
            const hasTicket = true;
    
            res.render("cart", {
                products,
                cart,
                ticket,
                title,
                cartInfo,
                purchaser,
                hasTicket
            });

        } catch (error) {
            req.logger.error("Error al renderizar finalizar compra. ",error); 
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
    
      
    
    
}

module.exports = ViewsController;