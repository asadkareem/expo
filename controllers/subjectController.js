const Subject = require('./../models/subjectModel');
const factory = require('./handlerFactory');

exports.getSubject = factory.getOne(Subject);
exports.createSubject = factory.createOne(Subject);
exports.getAllSubject = factory.getAll(Subject);
exports.updateSubject = factory.updateOne(Subject);
exports.deleteSubject = factory.deleteOne(Subject);
