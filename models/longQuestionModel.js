const mongoose = require('mongoose');
const longQuestionsSchema = new mongoose.Schema({
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
    ref: 'CurrentPaper',
  },
  longQuestions: [
    {
      longquestion: { type: String, required: true },
      answer: { type: String, required: true },
      questionRepeated: [{ type: String }],
    },
  ],
});
const LongQuestions = mongoose.model(
  'longQuestionsSchema',
  longQuestionsSchema
);
module.exports = LongQuestions;
