const mongoose = require('mongoose');
const pastPaperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
});

const PastPaper = mongoose.model('pastPaperSchema', pastPaperSchema);
module.exports = PastPaper;
