const express = require('express');
const lectureController = require('./../controllers/lectureContoller');
const authController = require('./../controllers/authController');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uplaod/' });
const { S3Client } = require('@aws-sdk/client-s3')
const fileparser = require('./../controllers/fileparser');
const lecture = require('./../models/lectureModel');
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
// router
//   .route('/')
//   .post(upload.single('lecture'), lectureController.lectureMiddleware);
router.route('/').post(async (req, res, next) => {

  try {


    // Use the parsefile function to upload the file to S3
    // console.log(req.body)
    const uploadedFile = await fileparser(req);


    // Construct the lectureLink using the uploadedFile data
    // const lectureLink = `${req.protocol}://${req.get('host')}/api/v1/lectures/getvideo?key=${uploadedFile.Key}`;

    // req.body.lectureLink = uploadedFile.Location;

    // Create the lecture document
    const doc = await lecture.create(Object.values(uploadedFile));

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(400).json({
      message: "An error occurred.",
      error: error,
    }) // Adjust the status code as needed
  }
});
router
  .route('/:id')
  .patch(
    upload.single('thumbNail'),
    lectureController.thumbNailMiddleware,
  )
  .delete(lectureController.deletelecture);


module.exports = router;
