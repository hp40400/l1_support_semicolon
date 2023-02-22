const mongoose = require('mongoose')

const clarificationMsgSchema = new Schema({
  request: String,
  response: String,
  timestamp: {
    type: Date,
    default: Date.now(),
  },
})

const clarificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Clarification Title is must'],
  },
  clarification: [clarificationMsgSchema],
  feedback: {
    is_satisfied: { type: Boolean },
    reason: { type: String, lowercase: true },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

exports.Clarification = mongoose.model('Clarification', clarificationSchema)
