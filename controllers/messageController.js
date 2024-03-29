const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Message = require('./../models/messageModel');
const Chat = require('./../models/chatModel');
const User = require('./../models/userModel');
const S3 = require('aws-sdk/clients/s3');
const parseChatImage = require("./chatimageparser")
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

  const { chatId, content, time, image } = await parseChatImage(req);
  if (!chatId) {
    return next(new AppError('Please Provide Message And Chat Id', 400));
  }
  let newMessage = {
    sender: req.user._id,
    chat: chatId,
    time: time,
  };
  if (image) {
    newMessage.image = image;
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
    // const chatId = populatedMessage.chat._id;
    const messageId = populatedMessage._id;
    const senderId = populatedMessage.sender._id;

    const sender = await User.findById(senderId);

    const { users } = await Chat.findById(chatId).populate('users');
    console.log(users);
    let nonSenderId;

    for (const user of users) {
      if (user._id.toString() !== senderId.toString()) {
        nonSenderId = user._id;
        break;
      }
    }
    if (sender.role == 'admin') {
      const user = await User.findByIdAndUpdate(
        nonSenderId._id, // Assuming 'sender._id' represents the admin user's ID
        { $inc: { adminSentMsgCount: 1 }, messageTime: time },
        { new: true }
      );
    } else {
      const user = await User.findByIdAndUpdate(
        senderId, // Assuming 'sender._id' represents the admin user's ID
        { $inc: { userSentMsgCount: 1 }, messageTime: time },
        { new: true }
      );
    }
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

exports.userSentMsgCountZero = async (req, res) => {
  try {
    const { userId } = req.query;

    // Find the user by the provided userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Set userSentMsgCount to zero
    user.userSentMsgCount = 0;
    // Save the updated user
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'User message sent count reset to zero',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred',
    });
  }
};

exports.adminSentMsgCountZero = async (req, res) => {
  try {
    const { userId } = req.query;

    // Find the user by the provided userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Set userSentMsgCount to zero
    user.adminSentMsgCount = 0;

    // Save the updated user
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Admin message sent count reset to zero',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred',
    });
  }
};


var admin = require("firebase-admin");

var serviceAccount = require("./../black-terminus-389616-firebase-adminsdk-nmx2q-169a0c957a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




exports.sendPushNotification = async (req, res) => {
  const message = {
    notification: {
      title: req.body.title,
      body: req.body.message,
    },
    token: req.body.fcm_token,
    data: {
      volume: "3.21.15",
      contents: "http://www.news-magazine.com/world-week/21659772"
    },
    android: {
      priority: "high",

    },
    webpush: {
      headers: {
        Urgency: "high"
      }
    },
    apns: {
      headers: {
        'apns-priority': '10'
      }
    },
  };

  admin.messaging().send(message).then((response) => {
    res.status(200).json({
      success: true,
      response: response
    })
    console.log('Successfully sent message: ', response);
  })
    .catch((error) => {
      res.status(500).json({
        status: "error",
        response: error
      })
      console.log('Error sending message: ', error);
    });

}




