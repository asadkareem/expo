const express = require('express');
const lectureController = require('./../controllers/lectureContoller');
const authController = require('./../controllers/authController');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uplaod/' });
const busboy = require('connect-busboy');

const parsefile = require('./../controllers/fileparser');
const lecture  = require('./../models/lectureModel');

router.route('/getvideo').get(lectureController.getFileFromS3);
router.route('/thumbNail').get(lectureController.getImageFromS3);

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
      const uploadedFile = await parsefile(req);
      
  
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
