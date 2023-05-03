const express = require('express');
const authContoller = require('../controllers/authController');
const pastPaperController = require('../controllers/pastPaperController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(pastPaperController.getAllPastPapaer);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(pastPaperController.createPastPapaer);
router
  .route('/:id')
  .get(pastPaperController.getPastPapaer)
  .patch(pastPaperController.updatePastPapaer)
  .delete(pastPaperController.deletePastPapaer);
module.exports = router;
