const express = require('express');
const lectureController = require('./../controllers/lectureContoller');
const authController = require('./../controllers/authController');
const multer = require('multer');
const router = express.Router();

router.use(authController.protect);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/lectures');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

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
    upload.single('lecture'),
    lectureController.lectureUpdateMiddleware,
    lectureController.updatelecture
  )
  .delete(lectureController.deletelecture);
module.exports = router;
