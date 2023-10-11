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

exports.lectureMiddleware = catchAsync(async (req, res, next) => {

  if (!req.file) {
    return next(new AppError('you must upload the lecture', 404));
  }
  req.body.lectureLink = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/lectures/getvideo?key=${req.file.key}`;
  const doc = await lecture.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});


exports.thumbNailMiddleware = catchAsync(async (req, res, next) => {
  // Check if file is uploaded
  if (!req.file) {
    return next(new AppError('you must upload the thumbNail', 404));
  }

  const result = await uploadFile(req.file);
  req.body.thumbNail = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/lectures/thumbNail?key=${result.Key}`;
  const doc = await lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// exports.getFileFromS3 = (req, res) => {
//   const bucketName = 'expolearn';
//   const key = req.query.key;

//   const params = {
//     Bucket: bucketName,
//     Key: key,
//   };

//   const fileStream = s3.getObject(params).createReadStream();

//   fileStream.on('error', (err) => {
//     console.error('Error retrieving file from Amazon S3:', err);
//     res.status(500).json({ error: 'Failed to retrieve file from Amazon S3' });
//   });

//   res.type('video/mp4');
//   fileStream.pipe(res);

//   res.on('close', () => {
//     // Handle the closure of the response
//     fileStream.destroy(); // Stop the file stream explicitly
//   });
// };
exports.getFileFromS3 = (req, res) => {
  const bucketName = 'expolearn';
  const key = req.query.key;
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const headParams = {
    Bucket: bucketName,
    Key: key,
  };

  // Get the file size for the requested S3 object to calculate the Content-Length
  s3.headObject(headParams, (err, metadata) => {
    if (err) {
      console.error('Error retrieving file metadata from Amazon S3:', err);
      res.status(500).json({ error: 'Failed to retrieve file metadata from Amazon S3' });
      return;
    }

    const fileSize = metadata.ContentLength;
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0]);
      const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;

      const chunkSize = end - start + 1;
      params.Range = `bytes=${start}-${end}`;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', 'video/mp4');
      res.status(206); // 206 Partial Content

      const fileStream = s3.getObject(params).createReadStream();

      fileStream.on('error', (err) => {
        console.error('Error retrieving file from Amazon S3:', err);
        res.status(500).json({ error: 'Failed to retrieve file from Amazon S3' });
      });

      fileStream.pipe(res);
    } else {
      // No range header provided, so send the entire file
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', 'video/mp4');
      res.status(200);

      const fileStream = s3.getObject(params).createReadStream();

      fileStream.on('error', (err) => {
        console.error('Error retrieving file from Amazon S3:', err);
        res.status(500).json({ error: 'Failed to retrieve file from Amazon S3' });
      });

      fileStream.pipe(res);
    }
  });
};

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
exports.getlecture = factory.getOne(lecture);
exports.createlecture = factory.createOne(lecture);
exports.getAlllecture = factory.getAll(lecture);
exports.updatelecture = factory.updateOne(lecture);
exports.deletelecture = factory.deleteOne(lecture);
