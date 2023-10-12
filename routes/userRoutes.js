const express = require('express');
const authContoller = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uplaod/' });
const router = express.Router();

router.get('/resetPassword/:token', (req, res) => {
  const token = req.params.token;
  res.render('reset-password', { token });
});

router.post('/resetPassword/:token', authContoller.resetPassword);

router.post('/signup', authContoller.signup);
router.post('/login', authContoller.login);
router.post('/forgotPassword', authContoller.forgotPassword);
router.get('/logout', authContoller.logout);

// Protect all routes after this middleware
router.route('/getImage').get(userController.getImageFromS3);
router.use(authContoller.protect);
router.get('/me', userController.getMe, userController.getUser);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateMyPassword', authContoller.updatePassword);
router.patch('/updateMe', userController.updateMe);
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
