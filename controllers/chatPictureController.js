const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const ChatPicture = require('./../models/chatPictureModel');
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

exports.sendChatPicture = catchAsync(async (req, res, next) => {
  const { chatId } = req.body;
  if (!chatId) {
    return next(new AppError('Please Provide  Chat Id', 400));
  }
  if (req.file) {
    const chatImage = await uploadFile(req.file);
    req.body.chatImage = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/getImage?key=${chatImage.Key}`;
  }

  var newChatPicture = {
    sender: req.user._id,
    picture: req.body.chatImage,
    chat: chatId,
  };
  try {
    const chatPicture = await ChatPicture.create(newChatPicture);
    const populatedChatPicture = await ChatPicture.findById(chatPicture._id)
      .populate('sender')
      .populate({
        path: 'chat',
        populate: {
          path: 'users',
          model: 'User', // Replace 'User' with your actual Mongoose model name for users
        },
      })
      .exec();
    res.status(200).json({
      status: 'success',
      data: {
        chatPicture: populatedChatPicture,
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

exports.getChatPictures = catchAsync(async (req, res, next) => {
  try {
    const populatedChat = await ChatPicture.find({
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
      chatImages: populatedChat.length,
      data: {
        populatedChat,
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
