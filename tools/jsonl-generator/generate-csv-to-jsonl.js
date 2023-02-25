// Import FileSystem
const fs = require('fs')
const csvParser = require('csv-parser')

// Import the OpenAI
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: 'OPENAI_API_KEY',
})

const openai = new OpenAIApi(configuration)

const generate = function () {
  try {
    const csvDataSet = []
    fs.createReadStream(`${__dirname}/input-file/stackoverflow-data.csv`)
      .pipe(csvParser())
      .on('data', (data) => {
        csvDataSet.push(data)
      })
      .on('end', async () => {
        try {
          const filterData = csvDataSet.map(async (rowData) => {
            const obj = {
              QuestionTitle: rowData.QuestionTitle,
              QuestionBody: rowData.QuestionBody,
              AcceptedAnswerBody: rowData.AcceptedAnswerBody,
            }

            // Combined Context string
            const contextString = `${obj.QuestionTitle} ${obj.QuestionBody} ${obj.AcceptedAnswerBody}`

            console.log('contextString', contextString)

            // Prompt string use to pass for openAI API
            const promptContext = `create question and answares following {'question': '<question text>', 'answare': '<generated text>'} format from given ${JSON.stringify(
              contextString,
            )}`

            /**
             * This will generate us this format {'prompt': '<prompt text>', 'completion': '<ideal generated text>'}
             */
            // const promptContext = `take propertie QuestionTitle, QuestionBody, AcceptedAnswerBody  value from ${JSON.stringify(
            //   obj,
            // )} and prepare jsonl following format {'prompt': '<prompt text>', 'completion': '<ideal generated text>'}`

            const response = await openai.createCompletion({
              model: 'text-davinci-003',
              prompt: promptContext,
              temperature: 0.6,
              max_tokens: 1000,
            })

            return response.data.choices[0].text
          })

          console.log('Array of data', filterData)

          try {
            const allPromistResult = Promise.allSettled(filterData)
              .then((results) => {
                if (results) {
                  const prompltComplData = results.map((res) => {
                    if (res.status == 'fulfilled' && res.value) {
                      return res.value
                    }
                  })

                  if (prompltComplData.length) {
                    // Write a file
                    fs.writeFileSync(
                      `${__dirname}/output-file/stackoverflows-data.jsonl`,
                      prompltComplData.toString(),
                    )
                  }
                }
              })
              .catch((error) => {
                console.error(error)
              })

            console.log(allPromistResult)
          } catch (error) {
            res.json({
              status: 'fail',
              message: error,
            })
          }
        } catch (error) {
          res.json({
            status: 'fail',
            message: error,
          })
        }
      })
  } catch (error) {
    res.json({
      status: 'fail',
      message: error,
    })
  }
}

generate()
