const express = require("express");
const productsRouter = require("../routes/products.router");
const cartRouter = require("../routes/cart.router.js");
const { create } = require('express-handlebars');

const socket = require("socket.io");
const viewsRouter = require("../routes/views.router.js");
const path = require("path");
const db = require("./database.js");
const confiObj = require("../config/config.js");
const env = confiObj;

const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userRouter = require("../routes/user.router.js");
const sessionRouter = require("../routes/sessions.router.js");

const passport = require("passport");
const initializePassport = require("../config/passport.config.js");

class Server {
    // Se crea una instancia de express para crear el servidor.
    constructor() {
        this.app = express();
        this.port = env.port;
    }

    // Se crea un método para levantar el servidor al iniciar la aplicación.
    async start() {
        this.app.use(express.static(path.join(__dirname, "../public")));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(cookieParser());

        const hbs = create({
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
        });

        this.app.use(session({
            secret: "secret",
            resave: true,
            saveUninitialized: true,
            store: MongoStore.create({
                mongoUrl: "mongodb+srv://wiperalta:wiperalta@cluster0.ws0uxkf.mongodb.net/ecommerce?retryWrites=true&w=majority", ttl: 100
            })
        }))

        // Configuracion de motor de plantilla y handlebars
        this.app.engine("handlebars", hbs.engine);
        this.app.set("view engine", "handlebars");
        this.app.set("views", path.join(__dirname, "../views"));

        // Passport
        initializePassport();
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        // Routing
        this.app.use("/api/users", userRouter);
        this.app.use("/api/sessions", sessionRouter);
        this.app.use("/api/products", productsRouter);
        this.app.use("/api/carts", cartRouter);
        this.app.use("/", viewsRouter);

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