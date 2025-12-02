const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    trim: true
  },
  
  to: {
    type: String,
    required: true,
    trim: true
  },
  
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  body: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['inbox', 'sent', 'trash'],
    default: 'inbox'
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  trashedAt: {
    type: Date
  }
});

emailSchema.index({ to: 1, status: 1 });
emailSchema.index({ from: 1, status: 1 });

emailSchema.statics.getInbox = function(username) {
  return this.find({ to: username, status: 'inbox' }).sort({ sentAt: -1 });
};

emailSchema.statics.getSent = function(username) {
  return this.find({ from: username, status: 'sent' }).sort({ sentAt: -1 });
};

emailSchema.statics.getTrash = function(username) {
  return this.find({ 
    $or: [{ to: username }, { from: username }],
    status: 'trash'
  }).sort({ trashedAt: -1 });
};

module.exports = mongoose.model('Email', emailSchema);
