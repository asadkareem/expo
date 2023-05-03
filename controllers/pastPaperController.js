const PastPapaer = require('../models/pastPapaerModel');
const factory = require('./handlerFactory');

exports.getPastPapaer = factory.getOne(PastPapaer);
exports.createPastPapaer = factory.createOne(PastPapaer);
exports.getAllPastPapaer = factory.getAll(PastPapaer);
exports.updatePastPapaer = factory.updateOne(PastPapaer);
exports.deletePastPapaer = factory.deleteOne(PastPapaer);
