const mongoose = require('mongoose');

const ipfsFileSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    associatedAidId: {
      type: String,
      default: null
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verificationDate: {
      type: Date,
      default: null
    },
    transactionHash: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IPFSFile', ipfsFileSchema); 