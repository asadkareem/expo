const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');
const fs = require('fs');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const s3 = new S3({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: 'AKIAV64CGJACZG3A2TH3',
    secretAccessKey: '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',
  },
});
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: 'expolearn',
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = req.body;
  const imageResult = await uploadFile(req.file);

  if (req.file)
    filteredBody.photo = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/getImage?key=${imageResult.Key}`;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.updateSubScription = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'subScriptionDate');
  //updating the subscription
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getImageFromS3 = (req, res) => {
  const bucketName = 'expolearn';
  const key = req.query.key;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  // Set the timeout value for the AWS SDK globally
  AWS.config.update({
    httpOptions: {
      timeout: 0, // Set to 0 or a higher value (in milliseconds)
    },
  });
  const s3 = new S3({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: 'AKIAV64CGJACZG3A2TH3',
      secretAccessKey: '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',
    },
  });

  const fileStream = s3.getObject(params).createReadStream();

  fileStream.on('error', (err) => {
    console.error('Error retrieving file from Amazon S3:', err);
    res.status(500).json({ error: 'Failed to retrieve file from Amazon S3' });
  });

  res.type('image/jpg');
  fileStream.pipe(res);

  res.on('close', () => {
    // Handle the closure of the response
    fileStream.destroy(); // Stop the file stream explicitly
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
