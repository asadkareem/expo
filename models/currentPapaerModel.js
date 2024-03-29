const mongoose = require('mongoose');
const currentPaperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String
  },
  year: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
});
const CurrentPaper = mongoose.model('CurrentPaper', currentPaperSchema);
module.exports = CurrentPaper;
