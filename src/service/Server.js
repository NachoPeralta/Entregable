const express = require("express");
const productsRouter = require("../routes/products.router");
const cartRouter = require("../routes/cart.router.js");
const {create} = require('express-handlebars');

const socket = require("socket.io");
const viewsRouter = require("../routes/views.router.js");
const path = require("path");
const db = require("./database.js");

class Server {
    // Se crea una instancia de express para crear el servidor.
    constructor() {
        this.app = express();
        this.port = 8080;
    }

    // Se crea un método para levantar el servidor al iniciar la aplicación.
    async start() {
        this.app.use(express.static(path.join(__dirname, "../public")));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        
        const hbs = create({
            runtimeOptions: {
              allowProtoPropertiesByDefault: true,
              allowProtoMethodsByDefault: true
            }
          });

        // Configuracion de motor de plantilla y handlebars
        this.app.engine("handlebars", hbs.engine);
        this.app.set("view engine", "handlebars");
        this.app.set("views", path.join(__dirname, "../views"));

        // Routing
        this.app.use("/api/products", productsRouter);
        this.app.use("/api/carts", cartRouter);
        this.app.use("/", productsRouter);

        const httpServer = this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en el puerto ${this.port}`);
        });

        //Chat
        const MessageModel = require("../models/message.model.js");

        const io = new socket.Server(httpServer);
        
        io.on("connection", (socket) => {
            console.log("Nuevo usuario conectado");

            socket.on("message", async data => {

                //Guardo el mensaje en MongoDB: 
                await MessageModel.create(data);

                //Obtengo los mensajes de MongoDB y se los paso al cliente: 
                const messages = await MessageModel.find();
                
                io.sockets.emit("message", messages);
            })
        })
    }
}

module.exports = Server;