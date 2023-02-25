const express = require('express')
const clarificationRoute = express.Router()

// clarification controller
const clarificationController = require('../controllers/clarification.controller')

clarificationRoute
  .route('/')
  .get(clarificationController.getAllClarificationList)
  .post(clarificationController.createNewClarification)

clarificationRoute
  .route('/:clarificationId')
  .get(clarificationController.retriveClarificationDataById)
  .post(clarificationController.askAndClarify)
  .patch(clarificationController.updateClarificationTitleById)
  .delete(clarificationController.deleteClarificationById)

clarificationRoute
  .route('/feedback/:clarificationId')
  .patch(clarificationController.submitClarificationFeedback)

module.exports = clarificationRoute
