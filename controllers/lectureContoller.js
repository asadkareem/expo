const lecture = require('./../models/lectureModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');
const fs = require('fs');
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
//get the file back from the s3
const getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: 'expolearn',
  };
  return s3.getObject(downloadParams).createReadStream();
};
//uplaod the file
const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: 'expolearn',
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
};
exports.lectureMiddleware = catchAsync(async (req, res, next) => {
  // Check if file is uploaded
  if (!req.file) {
    return next(new AppError('you must upload the lecture', 404));
  }

  const result = await uploadFile(req.file);
  console.log(result);
  req.body.lectureLink = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/lectures/getvideo?key=${result.Key}`;
  const doc = await lecture.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.lectureUpdateMiddleware = (req, res, next) => {
  if (req.file.filename) {
    req.body.lectureLink = req.file.filename;
  }
  next();
};
exports.getFileFromS3 = (req, res) => {
  const bucketName = 'expolearn';
  const key = req.query.key;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const fileStream = s3.getObject(params).createReadStream();

  fileStream.on('error', (err) => {
    console.error('Error retrieving file from Amazon S3:', err);
    res.status(500).json({ error: 'Failed to retrieve file from Amazon S3' });
  });

  res.type('video/mp4');
  fileStream.pipe(res);

  res.on('close', () => {
    // Handle the closure of the response
    fileStream.destroy(); // Stop the file stream explicitly
  });
};

exports.getlecture = factory.getOne(lecture);
exports.createlecture = factory.createOne(lecture);
exports.getAlllecture = factory.getAll(lecture);
exports.updatelecture = factory.updateOne(lecture);
exports.deletelecture = factory.deleteOne(lecture);
