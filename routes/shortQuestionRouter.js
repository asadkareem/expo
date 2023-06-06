const express = require('express');
const authContoller = require('../controllers/authController');
const shortQuestionController = require('../controllers/shortQuestionController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(shortQuestionController.getAllshortQuestion);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(shortQuestionController.createshortQuestion);
router
  .route('/:id')
  .get(shortQuestionController.getshortQuestion)
  .patch(shortQuestionController.updateshortQuestion)
  .delete(shortQuestionController.deleteshortQuestion);
module.exports = router;
