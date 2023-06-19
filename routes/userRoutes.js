const express = require('express');
const authContoller = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uplaod/' });
const router = express.Router();
router.post('/signup', authContoller.signup);
router.post('/login', authContoller.login);
router.post('/forgotPassword', authContoller.forgotPassword);
router.get('/logout', authContoller.logout);
router.patch('/resetPassword/:token', authContoller.resetPassword);

// Protect all routes after this middleware
// router.use(authContoller.protect);
router.get('/me', userController.getMe, userController.getUser);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateMyPassword', authContoller.updatePassword);
router.patch('/updateMe', upload.single('photo'), userController.updateMe);
router.route('/getImage').get(userController.getImageFromS3);
router.patch('/subScription', userController.updateSubScription);
//routes restricted to admin
router.route('/').get(userController.getAllUsers);
router.use(authContoller.restrictTo('admin'));
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
