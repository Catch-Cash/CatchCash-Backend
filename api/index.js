const router = require('express').Router();

router.use('/',require('./auth'));
router.use("/", require("./account"));
router.use("/", require("./goal"));

module.exports = router;
