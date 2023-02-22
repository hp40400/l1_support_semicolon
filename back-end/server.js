require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

// Router file
const openAIRoute = require('./routes/openaiRoute')

const app = express()
app.use(bodyParser.json())

const port = 3100

// Route
app.use('/openai-api', openAIRoute)

app.listen(port, () => {
  console.log(`Node server listening at http://localhost:${port}`)
})
