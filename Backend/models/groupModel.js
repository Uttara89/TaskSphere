const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      // Optional file attachment
      attachment: {
        fileName: String,
        cloudinaryUrl: String,
        cloudinaryPublicId: String,
        fileSize: Number,
        fileType: String,
      },
    },
  ],
  sharedFiles: [
    {
      uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      filePath: {
        type: String, // Local file path (optional, for debugging or fallback)
      },
      cloudinaryUrl: {
        type: String, // URL returned by Cloudinary
        required: true,
      },
      cloudinaryPublicId: {
        type: String, // Public ID returned by Cloudinary (useful for deletion)
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);