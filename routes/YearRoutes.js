const express = require('express');
const authContoller = require('./../controllers/authController');
const yearController = require('./../controllers/yearController');
const router = express.Router();

router.use(authContoller.protect);
router.route('/').get(yearController.getAllYear);
router.route('/').post(yearController.createYear);

module.exports = router;
