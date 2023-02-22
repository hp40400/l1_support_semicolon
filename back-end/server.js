// Mongoose
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const express = require('express')
const bodyParser = require('body-parser')

// Router file
const openAIRoute = require('./routes/openaiRoute')
const clarificationRoute = require('./routes/clarificationRoute')

const app = express()
app.use(bodyParser.json())

const port = 3100

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

// MongoDB Connection
mongoose.connect(DB).then(() => console.log('DB connection successful!'))

// Route
app.use('/openai-api', openAIRoute)
app.use('/api/clarification', clarificationRoute)

app.listen(port, () => {
  console.log(`Node server listening at http://localhost:${port}`)
})
