const express = require('express');
const lectureController = require('./../controllers/lectureContoller');
const authController = require('./../controllers/authController');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uplaod/' });
const { S3Client } = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')
router.route('/getvideo').get(lectureController.getFileFromS3);
router.route('/thumbNail').get(lectureController.getImageFromS3);
const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIAV64CGJACZG3A2TH3',
    secretAccessKey: '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',
  },
})

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'expolearn',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})
router.use(authController.protect);
router.route('/').get(lectureController.getAlllecture);
router.route('/:id').get(lectureController.getlecture);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .post(uploadS3.single('lecture'), lectureController.lectureMiddleware);
router
  .route('/:id')
  .patch(
    upload.single('thumbNail'),
    lectureController.thumbNailMiddleware,
  )
  .delete(lectureController.deletelecture);


module.exports = router;
