const mongoose = require("mongoose");
const confiObj = require("../config/config.js");
const {mongoUrl} = confiObj;

mongoose.connect(mongoUrl)
.then(() => {
    console.log("Connection Successful");
})
.catch((e) => {
    console.log(e);
})
