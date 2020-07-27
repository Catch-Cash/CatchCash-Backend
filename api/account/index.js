const express = require("express");
const controller = require("./account.controller");
const router = express.Router();
const middleware = require("../../middleware/auth");

router.get("/account", controller.getAccountList);
router.patch("/account", controller.changeAccountName);
router.get("/account/list", controller.getTransactions);
router.get("/account/list/:fintech_use_num", controller.getTransactions);
router.patch("/account/list", controller.modifyTransaction);
router.get("/test", controller.getLastestTransactions);

module.exports = router;
