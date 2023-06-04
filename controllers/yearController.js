const Year = require('./../models/yearModel');
const factory = require('./handlerFactory');

exports.createYear = factory.createOne(Year);
exports.getAllYear = factory.getAll(Year);
