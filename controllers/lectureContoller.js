const lecture = require('./../models/lectureModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.lectureMiddleware = catchAsync(async (req, res, next) => {
  // Check if file is uploaded
  if (!req.file) {
    return next(new AppError('you must upload the lecture', 404));
  }
  req.body.lectureLink = `${req.protocol}://${req.get('host')}/lectures/${
    req.file.filename
  }`;
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
exports.getlecture = factory.getOne(lecture);
exports.createlecture = factory.createOne(lecture);
exports.getAlllecture = factory.getAll(lecture);
exports.updatelecture = factory.updateOne(lecture);
exports.deletelecture = factory.deleteOne(lecture);
