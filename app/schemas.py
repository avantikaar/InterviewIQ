from pydantic import BaseModel, Field
from typing import Literal

class StartRequest(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=80)
    role: str = Field(min_length=2, max_length=100)
    level: Literal["Fresher", "Junior", "Mid-level"] = "Fresher"
    interview_type: Literal["Technical", "HR", "Mixed"] = "Technical"

class AnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=6000)
