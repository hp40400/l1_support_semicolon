// Import the OpenAI
const openai = require('../configs/openai.config')

const ClarificationModel = require('../models/clarificationModel')

async function getSortClarificationData() {
  const clarificationList = await ClarificationModel.find().sort({
    createdAt: -1,
  })

  return clarificationList
}

// Get All Clarifications
exports.getAllClarificationList = async (req, res) => {
  try {
    const clarificationList = await getSortClarificationData()

    res.status(200).json({
      status: 'success',
      result: clarificationList.length,
      data: {
        clarificationList,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

// Create New Clarification
exports.createNewClarification = async (req, res) => {
  try {
    const newClarificationData = {
      title: req.body.title,
      conversation: [],
      feedback: {
        is_satisfied: null,
        reason: null,
      },
      createdAt: Date.now(),
    }

    const existingClarification = await ClarificationModel.findOne(
      newClarificationData,
    )

    if (existingClarification) {
      return res.status(400).json({ message: 'Clarification already exists' })
    }

    const newClarification = await ClarificationModel.create(
      newClarificationData,
    )

    res.status(201).json({
      status: 'success',
      data: {
        newClarification,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

// retrive clarificationById
exports.retriveClarificationDataById = async (req, res) => {
  console.log(req.params)
  try {
    const clarificationData = await ClarificationModel.findById(
      req.params.clarificationId,
    )

    res.status(200).json({
      status: 'success',
      data: {
        clarificationData,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

// start conversation
exports.askAndClarify = async (req, res) => {
  try {
    const clarificationId = req.params.clarificationId
    const queryPrompt = req.body.request

    const queryPromptAnswareResponse = await getAnswareFromPromptModel(
      queryPrompt,
    )

    const clarificationData = await ClarificationModel.findById(clarificationId)

    const newUpdatedData = {
      ...clarificationData,
    }

    const newConversationData = {
      request: queryPrompt,
      response: queryPromptAnswareResponse?.replace('A:', '')?.trim(),
      timestamp: Date.now(),
    }
    newUpdatedData.conversations = [
      ...clarificationData.conversations,
      newConversationData,
    ]

    await ClarificationModel.findByIdAndUpdate(clarificationId, {
      conversations: newUpdatedData.conversations,
    })

    res.status(200).json({
      status: 'success',
      data: {
        newConversationData,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

async function getAnswareFromPromptModel(queryPrompt) {
  // Bringing in the training model
  let promptContext = `Hey It's all about one person, who has become a superstar in Sri Lanka, his name is Raheem Mohamed. he is one of the youngest software engineer in Sri Lanka. he is graduate in Bsc (hons) in computing which is awarded by Teesside university united kingdom. his passion is coding and he started his internship at Brand Centrical Pvt Ltd and now he is working as an Engineer Lead at Persistent Pvt Ltd. he specializes in Frontend Development and Backend Development with NodeJS and Express. for front end development, he is using Angular 7, Typescript, HTML5, Sass, and JavaScript. he is a really big fan of Javascript.
    P: Who is this raheem? 
    A: Raheem Mohamed is a software engineer from Sri Lanka. He is one of the youngest software engineers in the country and has a Bachelor's degree in Computing from Teesside University in the United Kingdom. He is currently working as an Engineer Lead at Persistent Pvt Ltd, specializing in Frontend and Backend development with NodeJS and Express, and using Angular 7, Typescript, HTML5, Sass, and JavaScript for the front-end. He is a big fan of Javascript. 
    P: is he frontend developer ?
    A: Yes, he is a frontend developer. He specializes in Frontend Development and Backend Development with NodeJS and Express. For front-end development, he is using Angular 7, Typescript, HTML5, Sass, and JavaScript.`

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${promptContext} ${queryPrompt} ?`,
      temperature: 0.6,
      max_tokens: 60,
    })

    return response.data.choices[0].text
  } catch (error) {
    return error
  }
}

exports.updateClarificationTitleById = async (req, res) => {
  try {
    const clarificationId = req.params.clarificationId
    const latestTitle = req.body.title

    const latestResponse = await ClarificationModel.findByIdAndUpdate(
      clarificationId,
      {
        title: latestTitle,
      },
    )

    res.status(200).json({
      status: 'success',
      data: {
        title: latestTitle,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.deleteClarificationById = async (req, res) => {
  try {
    const clarificationId = req.params.clarificationId

    await ClarificationModel.findByIdAndDelete(clarificationId)

    res.status(200).json({
      status: 'success',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.submitClarificationFeedback = async (req, res) => {
  try {
    const clarificationId = req.params.clarificationId

    await ClarificationModel.findByIdAndUpdate(clarificationId, {
      feedback: {
        is_satisfied: req.body.is_satisfied,
        reason: req.body.reason,
      },
    })

    res.status(200).json({
      status: 'success',
      message: 'Thank you for your feedback',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}
