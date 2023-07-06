const express = require('express');
const authContoller = require('../controllers/authController');
const chatPictureController = require('./../controllers/chatPictureController');
const multer = require('multer');
const upload = multer({ dest: 'uplaod/' });
const router = express.Router();

router.use(authContoller.protect);
router
  .route('/')
  .post(upload.single('photo'), chatPictureController.sendChatPicture);
router.route('/:chatId').get(chatPictureController.getChatPictures);

module.exports = router;
