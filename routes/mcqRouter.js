const express = require('express');
const authContoller = require('../controllers/authController');
const mcqController = require('../controllers/mcqController');
const router = express.Router();
router.use(authContoller.protect);
router.route('/').get(mcqController.getAllMcq);
router.use(authContoller.restrictTo('admin'));
router.route('/').post(mcqController.createMcq);
router
  .route('/:id')
  .get(mcqController.getMcq)
  .patch(mcqController.updateMcq)
  .delete(mcqController.deleteMcq);
module.exports = router;
