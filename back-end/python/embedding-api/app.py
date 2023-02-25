import os
from fastapi import FastAPI, Body, HTTPException, status
from fastapi.responses import Response, JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from typing import Optional, List
import motor.motor_asyncio
import json
from datetime import datetime
import requests
import re
import urllib.request
from bs4 import BeautifulSoup
from collections import deque
from html.parser import HTMLParser
from urllib.parse import urlparse
import os
import pandas as pd
import tiktoken
import openai
from openai.embeddings_utils import distances_from_embeddings
import numpy as np
from openai.embeddings_utils import distances_from_embeddings, cosine_similarity
from urllib3.exceptions import InsecureRequestWarning
from urllib3 import disable_warnings
from tenacity import (
    retry,
    stop_after_attempt,
    wait_random_exponential,
)  # for exponential backoff
import time
import pymongo

app = FastAPI()
uri = 'mongodb+srv://raheemmohamed:LlIjbnwkc7B25iKA@cluster0.xmv93el.mongodb.net/semicolon2023?retryWrites=true'
openai.api_key = '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'

# # Replace "my_mongodb_uri" with the URI of your MongoDB instance
client = pymongo.MongoClient(uri)
db = client["semicolon2023"]        
clarification = {"title": "My first blog post", "content": "Hello, world!"}

clarifications_collection = db["clarifications"]

@app.post("/", response_description="Add new clarification")
# async def create_clarification(clarification: Clarification = Body(...)):
async def create_clarification():

    clarifications_collection.insert_one(clarification)
    return JSONResponse(status_code=status.HTTP_201_CREATED)
    # return JSONResponse(status_code=status.HTTP_201_CREATED, content=clarification_obj)


@app.get("/")
def read_root():
    return {"Hello": "Semicolon"}


@app.post("/api/clarification/{clarificationId}")
async def get_embedded_prompt(clarificationId: str, question: str):
    # ans = "Heelo"
    # return {"id": clarificationId, "question": question}
    df=pd.read_csv('processed/embeddings.csv', index_col=0)
    df['embeddings'] = df['embeddings'].apply(eval).apply(np.array)

    df.head()
    return answer_question(df, question=question, debug=False) 

def create_context(
    question, df, max_len=1800, size="ada"
):
    """
    Create a context for a question by finding the most similar context from the dataframe
    """

    # Get the embeddings for the question
    q_embeddings = openai.Embedding.create(input=question, engine='text-embedding-ada-002')['data'][0]['embedding']

    # Get the distances from the embeddings
    df['distances'] = distances_from_embeddings(q_embeddings, df['embeddings'].values, distance_metric='cosine')


    returns = []
    cur_len = 0

    # Sort by distance and add the text to the context until the context is too long
    for i, row in df.sort_values('distances', ascending=True).iterrows():
        
        # Add the length of the text to the current length
        cur_len += row['n_tokens'] + 4
        
        # If the context is too long, break
        if cur_len > max_len:
            break
        
        # Else add it to the text that is being returned
        returns.append(row["text"])

    # Return the context
    return "\n\n###\n\n".join(returns)

def answer_question(
    df,
    model="text-davinci-003",
    question="Am I allowed to publish model outputs to Twitter, without a human review?",
    max_len=1800,
    size="ada",
    debug=False,
    max_tokens=300,
    stop_sequence=None
):
    """
    Answer a question based on the most similar context from the dataframe texts
    """
    context = create_context(
        question,
        df,
        max_len=max_len,
        size=size,
    )
    # If debug, print the raw model response
    if debug:
        print("Context:\n" + context)
        print("\n\n")

    try:
        # Create a completions using the questin and context
        response = openai.Completion.create(
            prompt=f"Answer the question based on the context below and elaborate with extra knowledge focusing on information from the context, and if the question can't be answered based on the context, say \"I don't know\"\n\nContext: {context}\n\n---\n\nQuestion: {question}\nAnswer:",
            temperature=1,
            max_tokens=max_tokens,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=stop_sequence,
            model=model,
        )
        return response["choices"][0]["text"].strip()
    except Exception as e:
        print(e)
        return ""
