const shortQuestion = require('../models/shortQuestionModal');
const factory = require('./handlerFactory');
exports.getshortQuestion = factory.getOne(shortQuestion);
exports.createshortQuestion = factory.createOne(shortQuestion);
exports.getAllshortQuestion = factory.getAll(shortQuestion);
exports.updateshortQuestion = factory.updateOne(shortQuestion);
exports.deleteshortQuestion = factory.deleteOne(shortQuestion);
