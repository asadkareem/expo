const express = require('express');
const authContoller = require('../controllers/authController');
const currentPapaerController = require('../controllers/currentPapaerController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(currentPapaerController.getAllCurrentPaper);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(currentPapaerController.createCurrentPaper);
router
  .route('/:id')
  .get(currentPapaerController.getCurrentPaper)
  .patch(currentPapaerController.updateCurrentPaper)
  .delete(currentPapaerController.deleteCurrentPaper);
module.exports = router;
