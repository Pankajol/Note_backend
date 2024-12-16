const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPublic: { type: Boolean, default: false }, // public or private note
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who created the note
});

module.exports = mongoose.model('Note', noteSchema);
