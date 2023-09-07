const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  catagory:{
    type:String,
    required:true
  }
});
const Class = mongoose.model('Class', classSchema);
module.exports = Class;
