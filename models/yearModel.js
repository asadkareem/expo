const mongoose = require('mongoose');
const yearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
});
const Year = mongoose.model('Year', yearSchema);
module.exports = Year;
