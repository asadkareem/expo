const express = require('express');
const authContoller = require('../controllers/authController');
const messageController = require('./../controllers/messageController');
const router = express.Router();

router.use(authContoller.protect);
router.route('/').post(messageController.sendMessage);
router.route('/:chatId').get(messageController.getMessage);

module.exports = router;
