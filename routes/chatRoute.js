const express = require('express');
const chats = require('./../utils/data');
const chatController = require('./../controllers/chatController');
const authContoller = require('../controllers/authController');
const router = express.Router();
//this is to get the all the chats
// router.route('/').get(fetchChats);

//*************-----------------for one to one chat-----------------*****************
router.use(authContoller.protect);
router.route('/').post(chatController.accessChat);
router.route('/').get(chatController.fetchChat);
//***********-------------------for the group chat--------------------*************** */
router.route('/group').post(chatController.createGroupChat);
router.route('/rename').put(chatController.renameGroup);
// router.route('/removeGroup').put(chatController.removeFromGroup);
router.route('/groupAdd').put(chatController.addToGroup);
router.route('/removeGroup').put(chatController.removeFromGroup);
//this route is to get the chat based on the id
module.exports = router;
