const express = require('express');
const authContoller = require('./../controllers/authController');
const classController = require('./../controllers/classController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(classController.getAllClass);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(classController.createClass);
router
  .route('/:id')
  .get(classController.getClass)
  .patch(classController.updateClass)
  .delete(classController.deleteClass);
module.exports = router;
