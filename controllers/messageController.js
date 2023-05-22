const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Message = require('./../models/messageModel');
const Chat = require('./../models/chatModel');
const User = require('./../models/userModel');

exports.sendMessage = catchAsync(async (req, res, next) => {
  //we will need the chatid to which we want to send the message -these will come from the body
  //the actual message we want to send - this will come from the body
  //who is the sender of the message for the groups (so we will get it from our middlware )
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    return next(new AppError('Please Provide Message And Chat Id', 400));
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    const message = await Message.create(newMessage);
    const populatedMessage = await Message.findById(message._id)
      .populate('sender')
      .populate({
        path: 'chat',
        populate: {
          path: 'users',
          model: 'User', // Replace 'User' with your actual Mongoose model name for users
        },
      })
      .exec();
    const chatId = populatedMessage.chat._id;
    const messageId = populatedMessage._id;

    await Chat.findByIdAndUpdate(chatId, { latestMessage: messageId });
    res.status(200).json({
      status: 'success',
      data: {
        message: populatedMessage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: err.message,
      },
    });
  }
});

exports.getMessage = catchAsync(async (req, res, next) => {
  try {
    const populatedMessage = await Message.find({
      chat: req.params.chatId,
    })
      .populate({
        path: 'sender',
        select: 'name email photo',
        model: 'User', // Replace 'User' with your actual Mongoose model name for users
      })
      .populate('chat')
      .exec();

    res.status(200).json({
      status: 'success',
      messages: populatedMessage.length,
      data: {
        populatedMessage,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      data: {
        message: err.message,
      },
    });
  }
});
