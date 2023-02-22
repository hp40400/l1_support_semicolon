const express = require('express')
const router = express.Router()

// controller
const openAIController = require('../controllers/openai.controller')

router.route('/').post(openAIController.getAnswareFromPromptModel)
router.route('/getAllModelList').get(openAIController.getListOfModels)
router.route('/getAllFineTunes').get(openAIController.getListOfFineTunes)
router
  .route('/generateJsonLFormatFile')
  .get(openAIController.convertCSVtoJSONAndGenerateJSONL)
router
  .route('/uploadJsonLFile')
  .post(openAIController.uploadJsonLFileForFineTuneModel)

router
  .route('/create-new-fine-tune-model')
  .post(openAIController.createFineTuneModel)

router
  .route('/get-answare-from-fine-tune')
  .post(openAIController.getAnswareFromFineTuneModel)

router
  .route('/retrive-fine-tune-job-data')
  .get(openAIController.retriveFineTuneJobData)

router
  .route('/delete-FineTune-Job')
  .delete(openAIController.deleteFineTuneJobById)

router
  .route('/cancelFineTuneByJobId')
  .post(openAIController.cancelFineTuneByJobId)

module.exports = router
