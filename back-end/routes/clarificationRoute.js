const express = require('express')
const clarificationRoute = express.Router()

// clarification controller
const clarificationController = require('../controllers/clarification.controller')

clarificationRoute
  .route('/')
  .get(clarificationController.getAllClarificationList)

module.exports = clarificationRoute
