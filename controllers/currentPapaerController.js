const CurrentPaper = require('../models/currentPapaerModel');
const factory = require('./handlerFactory');

exports.getCurrentPaper = factory.getOne(CurrentPaper);
exports.createCurrentPaper = factory.createOne(CurrentPaper);
exports.getAllCurrentPaper = factory.getAll(CurrentPaper);
exports.updateCurrentPaper = factory.updateOne(CurrentPaper);
exports.deleteCurrentPaper = factory.deleteOne(CurrentPaper);
