const express = require('express');
const controller = require('./auth.controller');
const middleware = require('../../middlewares/auth');
const router = express.Router();

router.get('/authorize',controller.authorize);
router.get('/authorize/callback',controller.authorize_callback);
router.get('/logout',middleware,controller.logout);
router.delete('/user',middleware,controller.secession);

module.exports = router;