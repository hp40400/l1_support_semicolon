# Open API Reference

-https://platform.openai.com/docs/api-reference/files/retrieve-content

## .env file configuration

- duplicate `.env.example` and rename it to `.env`

## Up and run the project

- First Do `npm install`
- run your dev environment using `npm run start`

## Mongoose & MongoDB

- Mongosse `https://mongoosejs.com/docs/index.html`
- MongoDB official Documentation `https://www.mongodb.com/`

## Basic Model training

https://techpro.ninja/how-to-train-openai-gpt-3/

## Advance Model Training | Fine Tuning

https://techpro.ninja/gpt-3-fine-tuning/

## Project Setup

- Do npm install
- Go to .env => and update with your API key

## Send Request to PostMon

- API URL:- http://localhost:3100/openai-api (POST Method)
- In the Body Pass Following - { "queryPrompt": "which area he is specialist?" }

## Ask Some Questions

- Who is Raheem
- which area he is specialist?

## newly upload file with JOSNL, 200 Response

{
"object": "file",
"id": "file-4az7Dw6W51fla713qEHtfuOk",
"purpose": "fine-tune",
"filename": "data.jsonl",
"bytes": 2261,
"created_at": 1677053681,
"status": "uploaded",
"status_details": null
}

## http://localhost:3100/openai-api/create-new-fine-tune-model

- POST: 200, response

{
"object": "fine-tune",
"id": "ft-Lf2gRhcHPTxP9eoIXdFxKWd7",
"hyperparams": {
"n_epochs": 4,
"batch_size": null,
"prompt_loss_weight": 0.01,
"learning_rate_multiplier": null
},
"organization_id": "org-rSreiIQltjc6fH7WNPGu7B16",
"model": "curie",
"training_files": [
{
"object": "file",
"id": "file-4az7Dw6W51fla713qEHtfuOk",
"purpose": "fine-tune",
"filename": "data.jsonl",
"bytes": 2261,
"created_at": 1677053681,
"status": "processed",
"status_details": null
}
],
"validation_files": [],
"result_files": [],
"created_at": 1677054168,
"updated_at": 1677054168,
"status": "pending",
"fine_tuned_model": null,
"events": [
{
"object": "fine-tune-event",
"level": "info",
"message": "Created fine-tune: ft-Lf2gRhcHPTxP9eoIXdFxKWd7",
"created_at": 1677054168
}
]
}
