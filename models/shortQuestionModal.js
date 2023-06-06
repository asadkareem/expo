const mongoose = require('mongoose');
const shortQuestionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  paperType: {
    type: String,
    required: true,
  },
  pastPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PastPaper',
  },
  currentPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CurrentPaper ',
  },
  shortQuestions: [
    {
      shortquestion: { type: String, required: true },
      answer: { type: String, required: true },
      questionRepeated: [{ type: String }],
    },
  ],
});
const ShortQuestions = mongoose.model(
  'ShortQuestionsSchema',
  shortQuestionsSchema
);
module.exports = ShortQuestions;
