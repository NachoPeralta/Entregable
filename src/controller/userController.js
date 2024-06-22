const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const { generateToken } = require("../utils/jsonwebtoken.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");
const UserDTO = require("../dto/user.dto.js");
const CustomError = require("../service/errors/custom.error.js");
const { infoRegister, infoCredencials } = require("../service/errors/info.js");
const { Errors } = require("../service/errors/enums.js");
const logger = require("../service/logs/logger.js");
const { generateResetToken } = require("../utils/resetToken.js");
const EmailManager = require("../service/email.js");
const emailManager = new EmailManager();
const ViewsController = require("../controller/viewsController.js");
const viewsController = new ViewsController();

class UserController {
    async register(req, res, next) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const userExist = await UserModel.findOne({ email });
            if (userExist) {
                throw CustomError.createError({
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
                age,
                last_connection: new Date()
            });

            await newUser.save();

            const token = generateToken({ user: newUser });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");

        } catch (error) {
            logger.error("Registro de usuario", error);
            return res.status(401).redirect("/api/users/failregister");
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        try {
            const userExist = await UserModel.findOne({ email });

            if (!userExist) {
                req.error = "Usuario no encontrado";
                req.message = "vuelva a intentar";

                logger.info(req.error);
                return res.status(401).redirect("/api/users/faillogin");
            }

            const isValid = isValidPassword(password, userExist);

            if (!isValid) {
                throw CustomError.createError({
                    name: "Login de Usuario",
                    cause: infoCredencials(),
                    message: "Erorr de credenciales",
                    code: Errors.INVALID_CREDENCIALS
                });
            }
            
            userExist.last_connection = new Date();
            await userExist.save();

            const token = generateToken({ user: userExist });
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });


            res.redirect("/api/users/profile");

        } catch (error) {
            logger.error("Error de ingreso.", error);
            return res.status(401).redirect("/api/users/faillogin");
        }
    }

    async profile(req, res) {
        const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.email, req.user.role, req.user.last_connection);
        const isAdmin = req.user.role === 'admin';
        const isPremium = req.user.role === 'premium';
        res.render("profile", { user: userDto, isAdmin, isPremium });
    }

    async logout(req, res) {

        if (req.user) {
            try {
                req.user.last_connection = new Date();
                await req.user.save();
            } catch (error) {
                console.error(error);
                res.status(500).send("Error interno del servidor");
                return;
            }
        }

        res.clearCookie("coderCookieToken");
        res.redirect("/login");
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

        logger.info(error, message);

        res.render("error", {
            error,
            message
        });
    }

    async failRegister(req, res) {
        const error = req.error != null ? req.error : "Error de registro";
        const message = req.message != null ? req.message : "Verifique los datos ingresados, es posible que el email ya se encuentre registrado";

        logger.info(error, message);

        res.render("error", {
            error,
            message
        });
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body;

        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            const token = generateResetToken();

            user.resetToken = {
                token: token,
                expiresAt: new Date(Date.now() + 3600000)
            };
            await user.save();

            // Enviar correo electrónico con el enlace de restablecimiento utilizando EmailService
            await emailManager.sendRestoreEmail(email, user.first_name, token);

            res.redirect("/confirmation-restore");

        } catch (error) {
            logger.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async resetPassword(req, res) {
        const { email, password, token } = req.body;
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.render("changepassword", { error: "Usuario no encontrado" });
            }

            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("passwordreset", { error: "El token de restablecimiento de contraseña es inválido" });
            }

            // Verifico token
            const now = new Date();
            if (now > resetToken.expiresAt) {
                return res.redirect("/changepassword");
            }

            if (isValidPassword(password, user)) {
                return res.render("changepassword", { error: "La nueva contraseña no puede ser igual a la anterior" });
            }

            user.password = createHash(password);
            user.resetToken = undefined;
            await user.save();

            return res.redirect("/login");

        } catch (error) {
            logger.error(error);
            return res.status(500).render("passwordreset", { error: "Error interno del servidor" });
        }
    }

    async changeRoleToPremium(req, res) {
        try {
            const { uid } = req.params;
                
            // Buscamos al usuario en la base de datos
            const user = await UserModel.findById(uid);
    
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
    
            // Documentos requeridos
            const requiredDocuments = ['Identificacion', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
            
            // Extraemos los nombres base de los documentos que el usuario ha subido
            const userDocuments = user.documents ? user.documents.map(doc => doc.name.split('.')[0]) : [];
    
            // Verificamos si el usuario tiene todos los documentos requeridos
            const hasRequiredDocuments = requiredDocuments.every(doc => userDocuments.includes(doc));
    
            if (!hasRequiredDocuments) {
                return res.status(400).json({ 
                    message: 'El usuario debe cargar los siguientes documentos: ' + requiredDocuments.join(', ') 
                });
            }
    
            // Cambiamos el rol del usuario
            const newRole = user.role === 'user' ? 'premium' : 'user';
            const updatedUser = await UserModel.findByIdAndUpdate(uid, { role: newRole }, { new: true });
    
            res.json(updatedUser);
    
        } catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
    async getUsers(req, res) {
        try {
            const users = await UserModel.find().sort({ last_connection: 1 }); // 1 para orden ascendente
            
            // Mapear a UserDTO
            const usersDto = users.map(user => new UserDTO(user.first_name, user.last_name, user.email, user.role, user.last_connection));
            
            res.status(200).json({ status: "Success", users: usersDto });

        } catch (error) {
            logger.error(error);
            return res.json({ message: 'Error interno del servidor' });
        }
    }

    async deleteOldUsers(req, res) {
        try {
            // Elimino los usuarios que estuvieron inactivos durante dos días
            const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    
            // Buscar usuarios inactivos o sin last_connection
            const inactiveUsers = await UserModel.find({
                $or: [
                    { last_connection: { $lt: twoDaysAgo } },
                    { last_connection: { $exists: false } }
                ]
            });
    
            // Enviar correos a los usuarios inactivos antes de eliminarlos
            for (const user of inactiveUsers) {
                await emailManager.sendNotificationEmail(user.email, user.first_name, "Eliminación por inactividad", "Tu cuenta ha sido eliminada por inactividad.");
            }
    
            // Eliminar usuarios inactivos o sin last_connection
            await UserModel.deleteMany({
                $or: [
                    { last_connection: { $lt: twoDaysAgo } },
                    { last_connection: { $exists: false } }
                ]
            });
    
            // Renderizar la vista de usuarios después de la eliminación
            viewsController.renderUsers(req, res);
    
        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
    
    async deleteUser(req, res) {
        try {
            const { uid } = req.params;
            const user = await UserModel.findById(uid);
    
            if (user) {
                // Enviar correo al usuario antes de eliminarlo
                await emailManager.sendNotificationEmail(user.email, user.first_name, "Cuenta eliminada", "Tu cuenta ha sido eliminada porque no cumple con los requisitos de la tienda.");
    
                // Eliminar el usuario
                await UserModel.findByIdAndDelete(uid);
            }
    
            viewsController.renderUsers(req, res);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
}

module.exports = UserController;