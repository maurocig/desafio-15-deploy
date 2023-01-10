const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  email: {
    type: String,
    required: true,
    // match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, 'Invalid email'],
  },
  message: { type: String, required: true },
});

MessageSchema.index({ email: 1 });

module.exports = MessageSchema;
