const express = require("express");
const router = express.Router();
const ViewsController = require("../controller/viewsController.js");
const viewsController = new ViewsController();
const UserController = require("../controller/userController.js");
const userController = new UserController();
const checkUserRole = require("../utils/checkrole.js");
const passport = require("passport");

router.get("/products", checkUserRole(['user']), passport.authenticate('jwt', { session: false }), viewsController.renderProducts);
router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(['admin', 'premium']), passport.authenticate('jwt', { session: false }), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(['user']), viewsController.renderChat);
router.get("/", viewsController.renderLogin);
router.get("/endPurchase/:cid/ticket/:tid", viewsController.renderPurchase);

router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderChangePassword);
router.get("/confirmation-restore", viewsController.renderConfirmationRestore);

module.exports = router;