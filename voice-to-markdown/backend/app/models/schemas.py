from pydantic import BaseModel
from enum import Enum
from typing import Optional

class ProcessingType(str, Enum):
    LECTURE = "lecture"
    MEETING = "meeting"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    TRANSCRIBING = "transcribing"
    SUMMARIZING = "summarizing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcessingRequest(BaseModel):
    type: ProcessingType
    filename: str

class ProcessingResponse(BaseModel):
    task_id: str
    status: ProcessingStatus
    message: str

class ProcessingStatusResponse(BaseModel):
    task_id: str
    status: ProcessingStatus
    progress: int
    message: str
    result_url: Optional[str] = None
    transcript: Optional[str] = None  # STT 결과 텍스트

class ResultResponse(BaseModel):
    task_id: str
    content: str
    filename: str
    created_at: str