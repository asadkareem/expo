const mongoose = require('mongoose');
const currentPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  paperType: {
    type: String,
    required: true,
  },
  mcqs: [
    {
      mcq: { type: String, required: true },
      options: [
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true },
      ],
      answer: { type: Number, required: true },
    },
  ],
  shortQuestions: [
    {
      shortquestion: { type: String, required: true },
      answer: { type: String, required: true },
      questionRepeated: [{ type: String }],
    },
  ],
  longQuestions: [
    {
      longquestion: { type: String, required: true },
      answer: { type: String, required: true },
      questionRepeated: [{ type: String }],
    },
  ],
  class: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
});
const CurrentPaper = mongoose.model('currentPaperSchema', currentPaperSchema);
module.exports = CurrentPaper;
