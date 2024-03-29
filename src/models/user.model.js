const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    age: {
        type: Number
    },
    password: {
        type: String
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
    role: {
        type: String,
        default: "user"
    }
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;