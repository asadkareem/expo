const mongoose = require('mongoose');
const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lectureLink: {
    type: String,
    required: [true, 'there must be a video'],
  },
  thumbNail: {
    type: String,
  },
  class: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
});
const Lecture = mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;
