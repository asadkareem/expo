const express = require('express');
const lectureController = require('./../controllers/lectureContoller');
const authController = require('./../controllers/authController');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uplaod/' });

router.route('/getvideo').get(lectureController.getFileFromS3);
router.route('/thumbNail').get(lectureController.getImageFromS3);

router.use(authController.protect);
router.route('/').get(lectureController.getAlllecture);
router.route('/:id').get(lectureController.getlecture);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .post(upload.single('lecture'), lectureController.lectureMiddleware);
router
  .route('/:id')
  .patch(
    upload.single('thumbNail'),
    lectureController.thumbNailMiddleware,
  )
  .delete(lectureController.deletelecture);


module.exports = router;
