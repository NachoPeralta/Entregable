const express = require("express");
const router = express.Router();
const ViewsController = require("../controller/viewsController.js");
const viewsController = new ViewsController();
const checkUserRole = require("../utils/checkrole.js");
const passport = require("passport");

router.get("/products", checkUserRole(['usuario']),passport.authenticate('jwt', { session: false }), viewsController.renderProducts);

router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(['admin']), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(['usuario']) ,viewsController.renderChat);
router.get("/", viewsController.renderLogin);

module.exports = router;