const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: String,
  duration: Number,
  subtitles: [{ start: Number, end: Number, text: String, translation: String }],
  keywords: [{
    word: String,
    phonetic: String,
    partOfSpeech: String,
    chineseDefinition: String,
    englishDefinition: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
