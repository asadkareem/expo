const Mcq = require('../models/mcqModel');
const factory = require('./handlerFactory');

exports.getMcq = factory.getOne(Mcq);
exports.createMcq = factory.createOne(Mcq);
exports.getAllMcq = factory.getAll(Mcq);
exports.updateMcq = factory.updateOne(Mcq);
exports.deleteMcq = factory.deleteOne(Mcq);
