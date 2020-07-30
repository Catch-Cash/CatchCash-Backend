const express = require("express");
const controller = require("./account.controller");
const router = express.Router();
const middleware = require("../../middlewares/auth");

router.get("/account", middleware, controller.getAccountList);
router.patch("/account", middleware, controller.changeAccountName);
router.get("/account/list", middleware, controller.getTransactions);
router.get(
  "/account/list/:fintech_use_num",
  middleware,
  controller.getTransactions
);
router.patch("/account/list", middleware, controller.modifyTransaction);
router.get("/test", controller.test);
router.get("/accountList", middleware, controller.getAccountList_test);
module.exports = router;
