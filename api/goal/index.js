const express = require("express");
const controller = require("./goal.controller");
const router = express.Router();
const middleware = require("../../middleware/auth");

router.get("/goal", controller.getGoals);
router.patch("/goal", controller.setGoal);

module.exports = router;
