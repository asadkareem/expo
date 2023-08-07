const express = require('express');
const authContoller = require('../controllers/authController');
const messageController = require('./../controllers/messageController');
const multer = require('multer');
const upload = multer({ dest: 'uplaod/' });
const router = express.Router();

router.use(authContoller.protect);
router.route('/').post(upload.single('image'), messageController.sendMessage);
router
  .route('/userSentMsgCountZero')
  .post(messageController.userSentMsgCountZero);
router
  .route('/adminSentMsgCountZero')
  .post(messageController.adminSentMsgCountZero);
router.route('/:chatId').get(messageController.getMessage);
router.route("/sendPushNotification").post(messageController.sendPushNotification)

module.exports = router;
