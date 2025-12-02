const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  clickPattern: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('clickPattern')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.clickPattern = await bcrypt.hash(this.clickPattern, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.compareClickPattern = async function(candidatePattern) {
  try {
    return await bcrypt.compare(candidatePattern, this.clickPattern);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);
