const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://wiperalta:wiperalta@cluster0.ws0uxkf.mongodb.net/ecommerce?retryWrites=true&w=majority")
.then(() => {
    console.log("Connection Successful");
})
.catch((e) => {
    console.log(e);
})
