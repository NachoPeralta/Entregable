const passport = require("passport");
const local = require("passport-local");
const jwt = require("passport-jwt");
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;
const GitHubStrategy = require("passport-github2");

const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");

const confiObj = require("../config/config.js");
const env = confiObj;

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
            if (newUser.age < 18) {
                error = "Para registrarte a este eCommerce debes ser mayor de 18 años"
                return done(error);
            }

            let result = await UserModel.create(newUser);

            return done(null, result);

        } catch (error) {
            return done(error);
        }
    }))


    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: env.secretWord
    }, async (jwt_payload, done) => {

        try {
            // Busca el usuario en la base de datos usando el ID del payload JWT
            const user = await UserModel.findById(jwt_payload.user._id);
            if (!user) {                
                return done(null, false);
            }

            return done(null, user); // Devuelve el usuario encontrado
        } catch (error) {
            return done(error);
        }
    }));


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
        callbackURL: "http://localhost:8080/api/users/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("GITHUB LOGIN Email:" + profile._json.email);

            
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
            } else {
                done(null, user);
            }

        } catch (error) {
            console.log(error);
            return done(error);
        }
    }))

    passport.use("current", new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
        // Recupero el token de la cookie
        const token = req.cookies.token;

        if (!token) {
            return done(null, false, { message: 'No se proporcionó un token.' });
        }

        try {
            const decoded = jwt.verify(token, env.secretWord);
            const user = await UserModel.findById(decoded.id);

            if (!user) {
                return done(null, false, { message: 'Usuario asociado al token no encontrado.' });
            }
            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }));
}

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["coderCookieToken"]
    }
    return token;
}


module.exports = initializePassport;