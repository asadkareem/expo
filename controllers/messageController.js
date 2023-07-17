const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Message = require('./../models/messageModel');
const Chat = require('./../models/chatModel');
const User = require('./../models/userModel');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const serviceAccount = require('./../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
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
  //we will need the chatid to which we want to send the message -these will come from the body
  //the actual message we want to send - this will come from the body
  //who is the sender of the message for the groups (so we will get it from our middlware )
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
const notification_options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24,
};
// exports.sendNotification = (req, res) => {
//   const registrationToken = req.body.registrationToken;
//   const notification = {
//     title: req.body.title,
//     body: req.body.message,
//   };
//   admin
//     .messaging()
//     .sendToDevice(registrationToken, { notification }, notification_options)
//     .then((response) => {
//       res.status(200).json({
//         res: response,
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

// exports.sendNotification = (req, res) => {
//   const registrationToken = req.body.registrationToken;
//   const notification = {
//     title: req.body.title,
//     body: req.body.message,
//   };
//   const data = {
//     title: req.body.title,
//     body: req.body.message,
//   };
//   const payload = {
//     notification: notification,
//     data: data,
//   };
//   admin
//     .messaging()
//     .sendToDevice(registrationToken, payload)
//     .then((response) => {
//       res.status(200).json({
//         res: response,
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

exports.sendNotification = async (req, res) => {
  const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
  const serverKey =
    'AAAA_hGxMTM:APA91bGsF4Accs7agUCRfTMH2YsphW4DTz1AYk1RQ_kEdi7FL28La_mQllTnZsqEpkZLcbpYTB2r6Wo3UyBcJ8ZWXdl2T20NTL1pIiM231hyk3QTINA2RMidh89Fr-I0CMG2OPzKKpvq'; // Replace with your FCM server key
  const payload = {
    to: req.body.registrationToken,
    data: {
      title: req.body.title,
      body: req.body.message,
      // Add any additional custom data here
    },
    notification: {
      title: req.body.title,
      body: req.body.message,
      // Customize other notification properties here
    },
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(fcmEndpoint, requestOptions);
    const data = await response.json();
    console.log('Push notification sent successfully:', data);
    res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({
      message: 'server error',
    });
  }
};
