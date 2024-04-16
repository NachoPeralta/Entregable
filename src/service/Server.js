//Complementos
const express = require("express");
const { create } = require('express-handlebars');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("../config/passport.config.js");

//Routers
const productsRouter = require("../routes/products.router");
const cartRouter = require("../routes/cart.router.js");
const userRouter = require("../routes/user.router.js");
const viewsRouter = require("../routes/views.router.js");
const mockingRouter = require("../routes/mocking.router.js");

//Conexión
const socket = require("socket.io");
const MongoStore = require("connect-mongo");
require("./database.js");

//Configuración
const path = require("path");
const cors = require("cors");
const confiObj = require("../config/config.js");
const env = confiObj;

class Server {
    // Se crea una instancia de express para crear el servidor.
    constructor() {
        this.app = express();
        this.port = env.port;
    }

    // Se crea un método para levantar el servidor al iniciar la aplicación.
    async start() {
        //Middleware
        this.app.use(express.static(path.join(__dirname, "../public")));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(cors());

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
        this.app.use(cookieParser());

        // Routing
        this.app.use("/api/users", userRouter);
        this.app.use("/api/products", productsRouter);
        this.app.use("/api/carts", cartRouter);
        this.app.use("/", viewsRouter);        
        this.app.use("/", mockingRouter);

        const httpServer = this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en el puerto ${this.port}`);
        });

        //Chat y RealTimeProducts
        const SocketManager = require("../sockets/socketmanager.js");
        new SocketManager(httpServer);
    }
}

module.exports = Server;