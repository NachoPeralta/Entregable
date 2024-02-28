const passport = require("passport");
const local = require("passport-local");
const GitHubStrategy = require("passport-github2");

const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");

const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
            let user = await UserModel.findOne({ email });
            if (user) return done(null, false);

            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: role ? role : "user"
            }

            let result = await UserModel.create(newUser);

            return done(null, result);

        } catch (error) {
            return done(error);
        }
    }))


    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
                const adminUser = {
                    _id: "admin",
                    first_name: "Admin",
                    last_name: "Admin",
                    email: "admin",
                    age: 40,
                    role: "admin"
                };
                return done(null, adminUser);
            } else {
                // Si no es el admin, realiza la búsqueda normal en la base de datos
                const user = await UserModel.findOne({ email });
                if (!user) {
                    console.log("Usuario no encontrado");
                    return done(null, false);
                }

                if (!isValidPassword(password, user)) return done(null, false);

                return done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))


    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({ _id: id });
        done(null, user);
    })

    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.f383f655e2d276ed",
        clientSecret: "20349f1d5bbb3030c03f5da09bae4f3ff9b45927",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            
            let user = await UserModel.findOne({ email: profile._json.email });
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    email: profile._json.email,
                    age: 0,
                    password: ""
                }
                let result = await UserModel.create(newUser);
                done(null, result);
            }else {
                done(null, user);
            }

        } catch (error) {
            console.log(error);
            return done(error);
        }
    }))


}


module.exports = initializePassport;