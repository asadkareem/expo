const express = require('express');
const authContoller = require('./../controllers/authController');
const subjectController = require('./../controllers/subjectController');
const router = express.Router();

router.use(authContoller.protect);
router.route('/').get(subjectController.getAllSubject);

//admin restricted routes
router.use(authContoller.restrictTo('admin'));
router.route('/').post(subjectController.createSubject);
router
  .route('/:id')
  .get(subjectController.getSubject)
  .patch(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);
module.exports = router;
