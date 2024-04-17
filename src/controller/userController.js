const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const { generateToken } = require("../utils/jsonwebtoken.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");
const UserDTO = require("../dto/user.dto.js");
const CustomError = require("../service/errors/custom.error.js");
const { infoRegister, infoCredencials } = require("../service/errors/info.js");
const { Errors } = require("../service/errors/enums.js");

class UserController {
    async register(req, res, next) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const userExist = await UserModel.findOne({ email });
            if (userExist) {
                CustomError.createError({
                    name: "Registro de Usuario",
                    cause: infoRegister(email),
                    message: "Correo electronico existente",
                    code: Errors.EMAIL_EXISTS
                });
            }

            //Creo un nuevo carrito y lo asigno al usuario 
            const newCart = new CartModel();
            await newCart.save();

            const newUser = new UserModel({
                first_name,
                last_name,
                email,
                cart: newCart._id,
                password: createHash(password),
                age
            });

            await newUser.save();

            const token = generateToken({ user: newUser });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");

        } catch (error) {
            console.error(error);
            next(error);
            // res.status(500).send("Error interno del servidor");
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        try {
            const userExist = await UserModel.findOne({ email });

            if (!userExist) {
                req.error = "Usuario no encontrado";
                req.message = "vuelva a intentar";

                return res.status(401).redirect("/api/users/faillogin");
            }

            const isValid = isValidPassword(password, userExist);

            if (!isValid) {
                CustomError.createError({
                    name: "Login de Usuario",
                    cause: infoCredencials(),
                    message: "Erorr de credenciales",
                    code: Errors.INVALID_CREDENCIALS
                });
                // req.error = "Error de credenciales";
                // req.message = "vuelva a intentar";

                // return res.status(401).redirect("/api/users/faillogin");
            }

            const token = generateToken({ user: userExist });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");

        } catch (error) {
            console.error(error);
            next(error);
            //res.status(500).send("Error interno del servidor");

        }
    }

    async profile(req, res) {
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
        const isAdmin = req.user.role === 'admin';
        res.render("profile", { user: userDto, isAdmin });
    }

    async logout(req, res) {
        res.clearCookie("coderCookieToken");
        req.session.destroy();
        res.redirect("/");
        //res.redirect("/login");
    }

    async admin(req, res) {
        if (req.user.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.render("admin");
    }

    async failLogin(req, res) {
        const error = req.error != null ? req.error : "Error de ingreso";
        const message = req.message != null ? req.message : "Verifique credenciales o ingrese a Nuevo Registro";

        res.render("error", {
            error,
            message
        });
    }
}

module.exports = UserController;