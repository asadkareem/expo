const mongoose = require('mongoose');
const chatPictureSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    picture: {
      type: String,
      trim: true,
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
const ChatPicture = mongoose.model('ChatPicture', chatPictureSchema);
module.exports = ChatPicture;
