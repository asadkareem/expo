const Class = require('./../models/classModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getClass = factory.getOne(Class);
exports.createClass = factory.createOne(Class);
exports.getAllClass = factory.getAll(Class);
exports.updateClass = factory.updateOne(Class);
exports.deleteClass = factory.deleteOne(Class);
