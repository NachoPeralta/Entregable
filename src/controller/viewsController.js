const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const TicketRepository = require("../repositories/ticket.repository.js");
const ticketRepository = new TicketRepository();
const UserModel = require("../models/user.model.js");
const logger = require("../service/logs/logger.js");
const UserDTO = require("../dto/user.dto.js");


class ViewsController {
    async renderProducts(req, res) {
        try {
            let limit = parseInt(req.query.limit) || 10;
            let page = parseInt(req.query.page) || 1;
            let category = req.query.category || "";
            let sort = req.query.sort || "asc";
            let title = "Listado de Productos"
            let owner = req.user.role !== "admin" ? req.user.email : req.user.role;

            const products = await productRepository.getProducts(limit, page, category, sort, owner, true);

            if (!products) {
                logger.info("No se encontraron productos", info);
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
            logger.error("Error al traer los productos", error);
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
                logger.info("Carrito no encontrado.", info);
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            let totalBuy = 0;

            const cartProducts = cart.products.map(item => {
                const product = item.product ? item.product.toObject() : null;
                const quantity = item.quantity;
                const totalPrice = (product ? product.price : 0) * quantity;

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
                hasTicket: false
            });

        } catch (error) {
            logger.error("Error del servidor al obtener el carrito", error);
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
            let title = "Listado de Productos";
            let owner = req.user.role !== "admin" ? req.user.email : req.user.role;
            
            const products = await productRepository.getProducts(limit, page, null, sort, owner, false);

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
                owner: owner
            });

        } catch (error) {
            logger.error("Error en la vista de productos en tiempo real. ", error);
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
            logger.error("Error al renderizar finalizar compra. ", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderResetPassword(req, res) {
        res.render("resetpassword");
    }

    async renderChangePassword(req, res) {
        res.render("changepassword");
    }

    async renderConfirmationRestore(req, res) {
        res.render("confirmation-restore");
    }

    async renderUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const loggedInUserId = req.user._id; 
            const role = req.user.role;

            // Contar la cantidad total de usuarios excepto el logueado
            const totalUsers = await UserModel.countDocuments({ _id: { $ne: loggedInUserId } });

            // Paginación
            const skipCount = (page - 1) * limit;
            let criteria = [
                { $match: { _id: { $ne: loggedInUserId } } }, // Excluir el usuario logueado
                { $skip: skipCount },
                { $limit: limit },
            ];

            const users = await UserModel.aggregate(criteria);
            const usersDto = users.map(user => new UserDTO(user.first_name, user.last_name, user.email, user.role, user.last_connection));

            // Calcula las propiedades de paginación
            const totalPages = Math.ceil(totalUsers / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            res.render("users", {
                users: usersDto,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                currentPage: page,
                hasPrevPage,
                hasNextPage,
                limit: limit,
                role: role,
                docs: usersDto,
                role:  role,
            });

        } catch (error) {
            logger.error("Error al obtener los usuarios", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

}

module.exports = ViewsController;