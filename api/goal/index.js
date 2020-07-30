const express = require("express");
const controller = require("./goal.controller");
const router = express.Router();
const middleware = require("../../middlewares/auth");

router.get("/goal", middleware, controller.getGoals);
router.patch("/goal", middleware, controller.setGoal);

module.exports = router;
