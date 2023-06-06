const mongoose = require('mongoose');
const mcqSchema = new mongoose.Schema({
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
      questionRepeated: [{ type: String }],
    },
  ],
});

const Mcq = mongoose.model('Mcq', mcqSchema);
module.exports = Mcq;
