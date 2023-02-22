// Import FileSystem
const fs = require('fs')
const csv = require('csvtojson')

// Import the OpenAI
const { Configuration, OpenAIApi } = require('openai')

// Create a new OpenAI configuration and paste your API key
// obtained from Step 1
// The key displayed here is a fake key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const openAIModelTrainData = fs.createReadStream(
  `./openai-model-data/data.jsonl`,
)

const sampleTeamDataCSVFile = './openai-model-data/sample-team-data.csv'

exports.getAnswareFromPromptModel = async (req, res) => {
  const data = req.body

  // Query the OpenAI API
  // Bringing in the training model about Raheem
  let promptContext = `Hey It's all about one person, who has become a superstar in Sri Lanka, his name is Raheem Mohamed. he is one of the youngest software engineer in Sri Lanka. he is graduate in Bsc (hons) in computing which is awarded by Teesside university united kingdom. his passion is coding and he started his internship at Brand Centrical Pvt Ltd and now he is working as an Engineer Lead at Persistent Pvt Ltd. he specializes in Frontend Development and Backend Development with NodeJS and Express. for front end development, he is using Angular 7, Typescript, HTML5, Sass, and JavaScript. he is a really big fan of Javascript.
    P: Who is this raheem? 
    A: Raheem Mohamed is a software engineer from Sri Lanka. He is one of the youngest software engineers in the country and has a Bachelor's degree in Computing from Teesside University in the United Kingdom. He is currently working as an Engineer Lead at Persistent Pvt Ltd, specializing in Frontend and Backend development with NodeJS and Express, and using Angular 7, Typescript, HTML5, Sass, and JavaScript for the front-end. He is a big fan of Javascript. 
    P: is he frontend developer ?
    A: Yes, he is a frontend developer. He specializes in Frontend Development and Backend Development with NodeJS and Express. For front-end development, he is using Angular 7, Typescript, HTML5, Sass, and JavaScript.
    P:`

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${promptContext} ${data.queryPrompt} ?`,
      temperature: 0.6,
      max_tokens: 60,
    })
    console.log(response.data)
    return res.json(response.data)
  } catch (error) {
    console.log(error)
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.getAnswareFromFineTuneModel = async (req, res) => {
  try {
    const data = req.body
    const response = await openai.createCompletion({
      model: 'davinci:ft-personal-2023-02-22-11-40-01',
      prompt: `${data.queryPrompt} ?`,
      temperature: 0.6,
      max_tokens: 60,
    })
    console.log(response.data)
    res.json(response.data)
  } catch (error) {
    console.log(error)
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

// getlist of models
exports.getListOfModels = async (req, res) => {
  try {
    const response = await openai.listModels()
    console.log(response.data)
    res.json(response.data)
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

// Get All fine tunes
exports.getListOfFineTunes = async (req, res) => {
  try {
    const response = await openai.listFineTunes()
    res.json(response.data)
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}
// upload jsonl format file for finetune
exports.uploadJsonLFileForFineTuneModel = async (req, res) => {
  try {
    const response = await openai.createFile(openAIModelTrainData, 'fine-tune')
    res.json(response.data)
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

// Create fine tune model based on uploaded jsonl
exports.createFineTuneModel = async (req, res) => {
  try {
    const response = await openai.createFineTune({
      training_file: process.env.JSONL_UPLOAD_FILE,
      model: 'davinci',
      suffix: 'my-team-test',
    })
    res.json(response.data)
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.deleteFineTuneModel = async (req, res) => {
  try {
    const response = await openai.deleteModel({
      training_file: process.env.JSONL_UPLOAD_FILE,
    })
    res.json(response.data)
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

// Convert CSV to JSON
exports.convertCSVtoJSONAndGenerateJSONL = async (req, res) => {
  try {
    const teamJsonArray = await csv().fromFile(sampleTeamDataCSVFile)

    const openAIPCData = teamJsonArray.map((team) => {
      const prompt = `Tell something about ${team?.Name}:`
      const completion = `His name is ${team?.Intro} and currently he working as ${team.JobTitle}, he is job role is ${team.JobRole} and he is expert in ${team.TechStack}`

      return { prompt: prompt, completion: completion }
    })

    const openAIJsonLFormat = openAIPCData
      .map((x) => JSON.stringify(x))
      .join('\n')

    console.log('openAIPCData', openAIJsonLFormat)

    fs.writeFileSync('./openai-model-data/data.jsonl', openAIJsonLFormat)

    res.json(teamJsonArray)
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

exports.retriveFineTuneJobData = async (req, res) => {
  try {
    const response = await openai.retrieveFineTune(`${req.body.fineTuneId}`)
    res.json(response.data)
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

exports.deleteFineTuneJobById = async (req, res) => {
  try {
    const response = await openai.deleteModel(req.body.model)
    res.json(response.data)
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

exports.cancelFineTuneByJobId = async (req, res) => {
  try {
    const response = await openai.cancelFineTune(`${req.body.findTuneId}`)
    res.json(response.data)
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}
