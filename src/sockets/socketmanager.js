const socket = require("socket.io");
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const MessageModel = require("../models/message.model.js");

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
                await productRepository.addProduct(product);
                this.emitUpdatedProducts(socket)
            });

            // Eliminar producto
            socket.on("deleteProduct", async (id) => {
                await productRepository.deleteProduct(id);
                this.emitUpdatedProducts(socket)
            });        
        });
    }

    async emitUpdatedProducts(socket) {
        socket.emit("products", await productRepository.getProducts);
    }
}

module.exports = SocketManager;
