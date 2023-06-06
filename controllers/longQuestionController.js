const longQuestion = require('../models/longQuestionModel');
const factory = require('./handlerFactory');

exports.getlongQuestion = factory.getOne(longQuestion);
exports.createlongQuestion = factory.createOne(longQuestion);
exports.getAlllongQuestion = factory.getAll(longQuestion);
exports.updatelongQuestion = factory.updateOne(longQuestion);
exports.deletelongQuestion = factory.deleteOne(longQuestion);
