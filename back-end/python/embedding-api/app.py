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
import pymongo

app = FastAPI()
client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
# db = client.college
db = client.semicolon2023


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class StudentModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(...)
    email: EmailStr = Field(...)
    course: str = Field(...)
    gpa: float = Field(..., le=4.0)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jdoe@example.com",
                "course": "Experiments, Science, and Fashion in Nanophotonics",
                "gpa": "3.0",
            }
        }


class UpdateStudentModel(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    course: Optional[str]
    gpa: Optional[float]

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jdoe@example.com",
                "course": "Experiments, Science, and Fashion in Nanophotonics",
                "gpa": "3.0",
            }
        }

class ConversationModel(BaseModel):
    request: str = Field(...)
    response: str = Field(...)
    timestamp: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.timestamp(),
        }

class FeedbackModel(BaseModel):
    is_satisfied: bool = Field(...)
    reason: str = Field(...)


class ClarificationModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(...)
    # conversations: List[ConversationModel]
    # feedback: FeedbackModel

    class Config:
        # allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "title": "what is mongodb"
                # "conversations": [{
                #                 "request": "what is mongodb",
                #                 "response": "MongoDB is an open-source, NoSQL database.",
                #                 }],
                # "feedback": [{
                #             "is_satisfied": True,
                #             "reason": "good",
                #             }],
            }
        }

# class UpdateClarificationModel(BaseModel):
#     title: str = Field(...)
#     conversations: List[ConversationModel]
#     feedback: FeedbackModel

#     class Config:
#         arbitrary_types_allowed = True
#         json_encoders = {ObjectId: str}
#         schema_extra = {
#             "example": {
#                 "title": "what is mongodb",
#                 "conversations": [{
#                                 "request": "what is mongodb",
#                                 "response": "MongoDB is an open-source, NoSQL database.",
#                                 }],
#                 "feedback": [{
#                             "is_satisfied": True,
#                             "reason": "good",
#                             }],
#             }
#         }


@app.post("/", response_description="Add new student", response_model=StudentModel)
async def create_student(student: StudentModel = Body(...)):
    student = jsonable_encoder(student)
    new_student = await db["students"].insert_one(student)
    created_student = await db["students"].find_one({"_id": new_student.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_student)


@app.get(
    "/", response_description="List all students", response_model=List[StudentModel]
)
async def list_students():
    students = await db["students"].find().to_list(1000)
    return students


@app.get(
    "/{id}", response_description="Get a single student", response_model=StudentModel
)
async def show_student(id: str):
    if (student := await db["students"].find_one({"_id": id})) is not None:
        return student

    raise HTTPException(status_code=404, detail=f"Student {id} not found")


@app.put("/{id}", response_description="Update a student", response_model=StudentModel)
async def update_student(id: str, student: UpdateStudentModel = Body(...)):
    student = {k: v for k, v in student.dict().items() if v is not None}

    if len(student) >= 1:
        update_result = await db["students"].update_one({"_id": id}, {"$set": student})

        if update_result.modified_count == 1:
            if (
                updated_student := await db["students"].find_one({"_id": id})
            ) is not None:
                return updated_student

    if (existing_student := await db["students"].find_one({"_id": id})) is not None:
        return existing_student

    raise HTTPException(status_code=404, detail=f"Student {id} not found")


# @app.delete("/{id}", response_description="Delete a student")
# async def delete_student(id: str):
#     delete_result = await db["students"].delete_one({"_id": id})

#     if delete_result.deleted_count == 1:
#         return Response(status_code=status.HTTP_204_NO_CONTENT)

#     raise HTTPException(status_code=404, detail=f"Student {id} not found")


@app.post("/", response_description="Add new clarification", response_model=ClarificationModel)
async def create_clarification(clarification: ClarificationModel = Body(...)):
    clarification = jsonable_encoder(clarification)
    new_clarification = await db["clarifications"].insert_one(clarification)
    created_clarification = await db["clarifications"].find_one({"_id": new_clarification.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_clarification)


@app.get(
    "/", response_description="List all clarifications", response_model=List[ClarificationModel]
)
async def list_clarifications():
    clarifications = await db["clarifications"].find().to_list(1000)
    return clarifications


# @app.get(
#     "/{id}", response_description="Get a single clarification", response_model=ClarificationModel
# )
# async def show_clarification(id: str):
#     if (clarification := await db["clarifications"].find_one({"_id": id})) is not None:
#         return clarification

#     raise HTTPException(status_code=404, detail=f"Clarification {id} not found")


# @app.put("/{id}", response_description="Update a clarification", response_model=ClarificationModel)
# async def update_clarification(id: str, clarification: UpdateClarificationModel = Body(...)):
#     clarification = {k: v for k, v in clarification.dict().items() if v is not None}

#     if len(clarification) >= 1:
#         update_result = await db["clarifications"].update_one({"_id": id}, {"$set": clarification})

#         if update_result.modified_count == 1:
#             if (
#                 updated_clarification := await db["clarifications"].find_one({"_id": id})
#             ) is not None:
#                 return updated_clarification

#     if (existing_clarification := await db["clarifications"].find_one({"_id": id})) is not None:
#         return existing_clarification

#     raise HTTPException(status_code=404, detail=f"Clarification {id} not found")


@app.delete("/{id}", response_description="Delete a clarification")
async def delete_clarification(id: str):
    delete_result = await db["clarifications"].delete_one({"_id": id})

    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Clarification {id} not found")
