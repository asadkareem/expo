const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Message = require('./../models/messageModel');
const Chat = require('./../models/chatModel');
const User = require('./../models/userModel');
const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new S3({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIAV64CGJACZG3A2TH3',
    secretAccessKey: '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',
  },
});
const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: 'expolearn',
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
};
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { chatId, content, time } = req.body;
  if (!chatId) {
    return next(new AppError('Please Provide Message And Chat Id', 400));
  }
  let newMessage = {
    sender: req.user._id,
    chat: chatId,
    time: time,
  };
  if (req.file) {
    const imageResult = await uploadFile(req.file);
    req.body.image = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/getImage?key=${imageResult.Key}`;
    newMessage.image = req.body.image;
  } else {
    newMessage.content = content;
  }
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
        select: '-unreadMessages',
      })
      .exec();
    const chatId = populatedMessage.chat._id;
    const messageId = populatedMessage._id;
    const senderId = populatedMessage.sender._id;
    await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: { latestMessage: messageId },
        $inc: { 'unreadMessages.$[elem].count': 1 },
      },
      {
        arrayFilters: [{ 'elem.user': { $ne: senderId } }],
        new: true,
      }
    );
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

exports.markMessageAsRead = async (req, res) => {
  try {
    await Chat.updateOne(
      { _id: req.body.chatId, 'unreadMessages.user': req.body.userId },
      { $set: { 'unreadMessages.$.count': 0 } }
    );
    res.status(200).json({
      message: 'successfully message is  marked to be read',
    });
  } catch (err) {
    res.status(500).json({
      message: ' marked read',
    });
  }
};
