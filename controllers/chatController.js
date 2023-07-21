const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Chat = require('./../models/chatModel');
const factory = require('./handlerFactory');
const User = require('../models/userModel');
//this is the api for one on one chat in which two users will be involve
exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    console.log('User ID was not sent with the request body');
    return res.status(400).json({
      message: 'User ID is not sent',
    });
  }

  try {
    const isChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate('users', '-password')
      .populate('latestMessage')
      .populate('latestMessage.sender', 'name photo email');

    if (isChat) {
      return res.send(isChat);
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      chatData.unreadMessages = chatData.users.map((user) => ({
        user: user,
        count: 0,
      }));
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );

      return res.status(200).json({
        message: 'Chat created',
        data: {
          fullChat,
        },
      });
    }
  } catch (error) {
    console.log('Error accessing chat:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to access chat',
    });
  }
});
//these are all the chats which user did
exports.fetchChat = catchAsync(async (req, res, next) => {
  try {
    Chat.find({
      users: req.user._id,
    })
      .populate('users')
      .populate('groupAdmin')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: 'latestMessage.sender',
          select: 'name photo email',
        });
        return res.status(200).json({
          status: 'success',
          results: result.length,
          data: {
            result,
          },
        });
      });
  } catch (err) {
    console.log('Error fetching chats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chats',
    });
  }
});
//creating the group chat
exports.createGroupChat = catchAsync(async (req, res, next) => {
  if (!req.body.name || !req.body.users) {
    return res.status(404).json({
      status: 'fail',
      message: 'please provide the users and the group name',
    });
  }
  const users = req.body.users;
  if (users.length < 2) {
    return res.status(404).json({
      status: fail,
      message: 'a group should have more than two users',
    });
  }
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      groupAdmin: req.user,
      isGroupChat: true,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users')
      .populate('groupAdmin');
    res.status(200).json({
      status: 'success',
      data: {
        fullGroupChat,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'failed to create group chat',
    });
  }
});

exports.renameGroup = catchAsync(async (req, res, next) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    return res.status(404).json({
      message: 'please provide the chatd and the groupname',
    });
  }
  try {
    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate('users')
      .populate('groupAdmin');
    if (!updateChat) {
      return res.status(404).json({
        message: 'chat not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        updateChat,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: {
        message: 'failed to rename group chat',
      },
    });
  }
});
exports.addToGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(404).json({
      message: 'please provide the chatd and the groupname',
    });
  }
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate('users')
      .populate('groupAdmin');
    res.status(200).json({
      status: 'success',
      data: {
        added,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: {
        message: 'failed to add user to group chat',
      },
    });
  }
});
exports.removeFromGroup = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(404).json({
      message: 'please provide the chatd and the groupname',
    });
  }
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate('users')
      .populate('groupAdmin');
    res.status(200).json({
      status: 'success',
      data: {
        added,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: {
        message: 'failed to add user to group chat',
      },
    });
  }
});
