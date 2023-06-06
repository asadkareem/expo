const express = require('express');
const authContoller = require('../controllers/authController');
const longQuestionController = require('../controllers/longQuestionController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(longQuestionController.getAlllongQuestion);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(longQuestionController.createlongQuestion);
router
  .route('/:id')
  .get(longQuestionController.getlongQuestion)
  .patch(longQuestionController.updatelongQuestion)
  .delete(longQuestionController.deletelongQuestion);
module.exports = router;
