const socket = require("socket.io");
const MessageModel = require("../models/message.model.js");
const UserController = require("../controller/userController");
const userController = new UserController();
const ProductController = require("../controller/productController");
const productController = new ProductController();

class SocketManager {
    constructor(httpServer) {
        this.io = socket(httpServer);
        this.initSocketEvents();
    }

    async initSocketEvents() {
        this.io.on("connection", async (socket) => {
                        
            //Chat
            socket.on("message", async data => {
                //Guardo el mensaje en MongoDB: 
                await MessageModel.create(data);

                //Obtengo los mensajes de MongoDB y se los paso al cliente: 
                const messages = await MessageModel.find();
                this.io.sockets.emit("message", messages);
            })

            // Agregar nuevo producto
            socket.on("addProduct", async (product) => {
                await productController.addProduct(product);
                this.emitUpdatedProducts(socket)
            });

            // Eliminar producto
            socket.on("deleteProduct", async (pid) => {
                await productController.deleteProduct(pid);
                this.emitUpdatedProducts(socket)
            });
            
            // Eliminar usuario
            socket.on("deleteUser", async (id) => {
                await userController.deleteUser(id);
                this.emitUpdatedProducts(socket)
            });

            // Eliminar usuarios antiguos
            socket.on("deleteOldUsers", async () => {
                await userController.deleteOldUsers();
                this.emitUpdatedProducts(socket)
            })
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productController.getProducts);
    }

    async emitUpdateUsers(socket) {
        socket.emit("users", await userController.getUsers);
    }
}

module.exports = SocketManager;
