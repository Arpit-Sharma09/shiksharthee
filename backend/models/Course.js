const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String
  },
  thumbnail: {
    type: String
  },
  videoUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
