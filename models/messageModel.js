const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
    },
    image: {
      type: String,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    createdAt: {
      type: Date,
      default: () => {
        const currentTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York',
        });
        return currentTime;
      },
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
