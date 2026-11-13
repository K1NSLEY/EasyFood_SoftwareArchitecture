const express = require('express');
const controller = require('./activity.controller');
const authenticate = require('../auth/auth.middleware');

const router = express.Router();

router.get('/', authenticate, controller.list);

module.exports = router;
