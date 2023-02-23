const mongoose = require('mongoose')

/**
 * Schema is where define the definition of the structures such as type, validation, default value etc.
 */
const clarificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Clarification Title is must'],
  },
  conversations: [{}],
  feedback: {
    is_satisfied: { type: Boolean },
    reason: { type: String, lowercase: true },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

// Model is the place where define schema and now this model includes with the model methods (ex: find, insertOne || save)
const ClarificationModel = mongoose.model('Clarification', clarificationSchema)

module.exports = ClarificationModel
