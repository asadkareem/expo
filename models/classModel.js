const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  catagory: {
    type: String,
    enum: ['General Education', 'Language', 'Professional'],
    required: [true, 'Please provide a your catagory'],
  },
});
const Class = mongoose.model('Class', classSchema);
module.exports = Class;
