const express = require('express');
const authContoller = require('../controllers/authController');
const messageController = require('./../controllers/messageController');
const multer = require('multer');
const upload = multer({ dest: 'uplaod/' });
const router = express.Router();

router.use(authContoller.protect);
router.route('/').post(upload.single('image'), messageController.sendMessage);
router.route('/:chatId').get(messageController.getMessage);

module.exports = router;
