const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
});
const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
