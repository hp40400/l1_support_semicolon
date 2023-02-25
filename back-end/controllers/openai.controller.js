// Import FileSystem
const fs = require('fs')
const csv = require('csvtojson')
const csvparser = require('csv-parser')

const similarity = require('compute-cosine-similarity')
// Import the OpenAI
const { Configuration, OpenAIApi } = require('openai')
const { encode, decode } = require('gpt-3-encoder')
const { flattenDeep } = require('lodash')

const math = require('mathjs')

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
/**
 * =====================================================
 * =============== testing controllers =================
 * =====================================================
 */
exports.takeContextFromCSV = async (req, res) => {
  try {
    const data = []
    let context = []
    fs.createReadStream('./openai-model-data/olympics_sections_text.csv')
      .pipe(csvparser())
      .on('data', (row) => {
        data.push(row)
      })
      .on('end', async () => {
        console.log(`Loaded ${data.length} rows from CSV file.`)

        // Preprocess context data as needed
        context = data.map((row) => {
          // Perform any necessary text preprocessing here
          return row.content
        })

        const contextString = flattenDeep(context)
          .join(' ')
          .replace(/(\r\n|\n|\r)/gm, '')

        console.log(`contextString`, contextString)

        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: `${data.queryPrompt}? ${contextString} `,
          temperature: 0.6,
          max_tokens: 60,
        })

        res.json({
          data: JSON.stringify(response.data.choices[0].text.trim()),
        })
      })
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

exports.creatingEmbeeding = async (req, res) => {
  try {
    //'https://api.openai.com/v1/tokenizer' // tokenizer
    // const readCSV = pd.read_csv(
    //   'https://cdn.openai.com/API/examples/data/olympics_sections_text.csv',
    // )
    // const response = await openai.createEmbedding({
    //   model: 'text-search-davinci-doc-001',
    //   input: 'The food was delicious and the waiter...',
    // })

    const data = []
    fs.createReadStream('./openai-model-data/olympics_sections_text.csv')
      .pipe(csvparser())
      .on('data', (row) => {
        data.push(row)
      })
      .on('end', async () => {
        console.log(`Loaded ${data.length} rows from CSV file.`)

        // Preprocess context data as needed
        const preprocessedData = data.map((row) => {
          // Perform any necessary text preprocessing here
          return row.content
        })

        // console.log(`preprocessedData ${preprocessedData} `)

        // Call OpenAI API to generate document embeddings for each context document
        const embeddings = []
        for (const document of preprocessedData) {
          const response = await openai.createEmbedding({
            input: document,
            model: 'text-embedding-ada-002',
          })

          // console.log('Embeded response', response.data.data[0].embedding)
          embeddings.push(response.data.data[0].embedding)
        }

        console.log('Embedding', embeddings)
        // Example usage
        answerQuestionWithContext('Olympic Host ?', embeddings, data)
          .then((response) => console.log('Raheemmmm', response))
          .catch((err) => {
            console.log('Its error', err)
          })
      })

    // console.log(data)

    res.json({
      data: [...data],
    })
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

// Define a function to construct the prompt for a user query
const constructPrompt = async (query, embeddings, df) => {
  console.log('Check my query', query)
  // Tokenize the user's query
  // const tokens = await tokenizeText(query)

  const encoded = encode(query)
  console.log('Encoded this string looks like: ', encoded)

  const decodetheData = decode(encoded)
  console.log('decodetheData encoded: ', decodetheData)

  // console.log('Response', response.data)

  // Find the context documents that are most relevant to the query
  const emb1 = [encoded]
  const emb2 = [embeddings[0]]
  console.log(`Similarity between "${encoded}" and "${emb2}"`)
  const embded = [...embeddings]
  const relevantDocuments = embded
    .map(async (embedding, i) => {
      const response = await openai.createCompletion({
        engine: 'text-davinci-002',
        prompt: `Similarity between "${encoded}" and "${embedding}":`,
        max_tokens: 300,
        n: 1,
        stop: '\n',
        temperature: 0,
      })

      console.log('Check my response', response.data)

      const data = {
        //tokens, embedding,
        index: i,
        similarity: response,
      }

      return parseFloat(response.choices[0].text)
    })
    .sort((a, b) => b.similarity - a.similarity)
    .map((item) => item.index)

  // Extract the text of the relevant documents
  console.log('relavantDoucmentats', relevantDocuments)
  console.log('embedding', embeddings)

  console.log('DF', df)

  const contextText = relevantDocuments.map((res, index) => {
    return df[index].content
  })
  // // Flatten and join the context text into a single string
  const contextString = flattenDeep(contextText).join(' ')
  // // Construct the prompt by concatenating the query and the relevant context text
  const prompt = `${query}\n\n${contextString}\n`
  return prompt
}

// Define a function to answer a user's question based on the context
const answerQuestionWithContext = async (query, embeddings, data) => {
  // Construct the prompt for the user's query
  const prompt = await constructPrompt(query, embeddings, data)

  // Call the OpenAI API to generate a response based on the prompt
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${prompt} ?`,
    temperature: 0.6,
    max_tokens: 60,
    n: 1,
    stop: ['\n'],
  })

  console.log('***********************', response.choices[0].text.trim())

  // Return the generated response
  return response.choices[0].text.trim()
}

// exports.embededModel = async (req, res) => {
//   try {
//     const data = []
//     let answares = null
//     const promptQuery = req.body.queryPrompt
//     fs.createReadStream('./openai-model-data/olympics_sections_text.csv')
//       .pipe(csvparser())
//       .on('data', (row) => {
//         data.push(row)
//       })
//       .on('end', async () => {
//         console.log(`Loaded ${data.length} rows from CSV file.`)
//         console.log(`data from csv`, data)

//         // Preprocess context data as needed
//         const preprocessedData = data.map((row) => {
//           // Perform any necessary text preprocessing here
//           return row.content
//         })

//         const embeddings = []
//         const prommptemd = []
//         for (const document of preprocessedData) {
//           const response = await openai.createEmbedding({
//             input: document,
//             model: 'text-embedding-ada-002',
//           })

//           // console.log('Embeded response', response.data.data[0].embedding)
//           embeddings.push(...response.data.data[0].embedding)
//         }

//         const responseQuery = await openai.createEmbedding({
//           input: promptQuery,
//           model: 'text-embedding-ada-002',
//         })

//         // console.log('Embeded response', response.data.data[0].embedding)
//         prommptemd.push(...responseQuery.data.data[0].embedding)

//         // const similarities = similarity(prommptemd, embeddings)

//         // console.log('AAAAAAAAAAAA', similarities)

//         // Define two vectors
//         const vec1 = [1, 2, 3]
//         const vec2 = [2, 4, 6]

//         const normalizeVector = (vector) => {
//           const norm = Math.sqrt(vector.reduce((acc, val) => acc + val ** 2, 0))
//           return vector.map((val) => val / norm)
//         }

//         const cosineSimilarity = (vector1, vector2) => {
//           const normalizedVector1 = normalizeVector(vector1)
//           const normalizedVector2 = normalizeVector(vector2)
//           const dotProduct = normalizedVector1.reduce(
//             (acc, val, i) => acc + val * normalizedVector2[i],
//             0,
//           )
//           return dotProduct
//         }

//         console.log(cosineSimilarity(prommptemd, embeddings))

//         const similarData = cosineSimilarity(prommptemd, embeddings)

//         console.log('parseFLoat similarData', similarData)

//         const relevantDocuments = embeddings.map((embedding, i) => {
//           console.log('parseFLoat embedding', parseFloat(embedding))
//           if (parseFloat(similarData) == parseFloat(embedding)) {
//             return {
//               //tokens, embedding,
//               index: i,
//               similarity: embedding,
//             }
//           }
//         })
//         // .sort((a, b) => b?.similarity - a?.similarity)
//         // .map((item) => {
//         //   console.log('Check my response', item)

//         //   if (item?.index) {
//         //     return item?.index
//         //   }
//         // })

//         // Extract the text of the relevant documents
//         console.log(
//           'relavantDoucmentats',
//           relevantDocuments.map((res) => {
//             if (res) {
//               return res
//             }
//           }),
//         )

//         // const newData = data
//         //   .map((row, index) => ({ ...row, similarity: row[similarData.i] }))
//         //   .sort((a, b) => b.similarity - a.similarity)

//         console.log('check my newData', similarData)

//         // Compute cosine similarity between vec1 and vec2
//         // const sim =
//         //   math.dot(prommptemd, embeddings) /
//         //   (math.norm(prommptemd) * math.norm(embeddings))

//         // console.log(`Cosine similarity between vec1 and vec2: ${sim}`)

//         res.json({
//           doteng: similarData,
//           embeded: embeddings.findIndex((a) => a == similarData),
//           promot: prommptemd,
//         })
//       })
//   } catch (err) {
//     res.json({
//       status: 'fail',
//       message: err,
//     })
//   }
// }

// New Try
exports.embededModel = async (req, res) => {
  const data = []

  fs.createReadStream('./openai-model-data/olympics_sections_text.csv')
    .pipe(csvparser())
    .on('data', (row) => {
      data.push(row)
    })
    .on('end', async () => {
      let context = null
      const row = data.find((row) => row.title == req.body.queryPrompt)

      if (row) {
        context = `${JSON.stringify(row.content)}`

        console.log(row)
      } else {
        // If no context is found for the prompt, return an error message

        res.json({
          data: 'Sorry, I am not sure what you are asking.',
          availableData: data,
        })
      }

      try {
        const result = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: ` ${context} P:${req.body.queryPrompt}`,
          maxTokens: 60,
          temperature: 0.6,
        })

        res.json({
          data: result.data.choices[0].text.trim(),
        })
      } catch (err) {
        res.json({
          status: 'fail',
          message: err,
        })
      }
    })
}
