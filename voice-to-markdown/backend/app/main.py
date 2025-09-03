import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uuid
from datetime import datetime

from .models.schemas import ProcessingType, ProcessingResponse, ProcessingStatusResponse
from .services.processor_demo import AudioProcessor

# Global state to store processing tasks
processing_tasks = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize audio processor
    app.state.audio_processor = AudioProcessor()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="Voice to Markdown API",
    description="음성을 Markdown으로 변환하는 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 업로드된 파일과 결과 파일 서빙
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Voice to Markdown API", "status": "running"}

@app.post("/upload", response_model=ProcessingResponse)
async def upload_audio(
    file: UploadFile = File(...),
    processing_type: ProcessingType = ProcessingType.LECTURE
):
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="오디오 파일만 업로드 가능합니다")
    
    # 고유 task ID 생성
    task_id = str(uuid.uuid4())
    
    # 파일 저장
    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{task_id}{file_extension}"
    file_path = f"uploads/{saved_filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # 처리 상태 초기화
    processing_tasks[task_id] = {
        "status": "pending",
        "progress": 0,
        "message": "처리 대기 중",
        "file_path": file_path,
        "processing_type": processing_type,
        "created_at": datetime.now().isoformat()
    }
    
    # 백그라운드에서 처리 시작
    asyncio.create_task(process_audio_task(task_id))
    
    return ProcessingResponse(
        task_id=task_id,
        status="pending",
        message="파일 업로드 완료. 처리를 시작합니다."
    )

@app.get("/status/{task_id}", response_model=ProcessingStatusResponse)
async def get_processing_status(task_id: str):
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다")
    
    task = processing_tasks[task_id]
    
    result_url = None
    if task["status"] == "completed":
        result_url = f"/download/{task_id}"
    
    return ProcessingStatusResponse(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        message=task["message"],
        result_url=result_url,
        transcript=task.get("transcript")
    )

@app.get("/download/{task_id}")
async def download_result(task_id: str):
    if task_id not in processing_tasks:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다")
    
    task = processing_tasks[task_id]
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="처리가 완료되지 않았습니다")
    
    result_path = f"results/{task_id}.md"
    if not os.path.exists(result_path):
        raise HTTPException(status_code=404, detail="결과 파일을 찾을 수 없습니다")
    
    return FileResponse(
        path=result_path,
        filename=f"voice-summary-{task_id}.md",
        media_type="text/markdown"
    )

@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    
    try:
        while True:
            if task_id in processing_tasks:
                task = processing_tasks[task_id]
                await websocket.send_json({
                    "task_id": task_id,
                    "status": task["status"],
                    "progress": task["progress"],
                    "message": task["message"],
                    "transcript": task.get("transcript")
                })
                
                if task["status"] in ["completed", "failed"]:
                    break
            
            await asyncio.sleep(1)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

async def process_audio_task(task_id: str):
    try:
        task = processing_tasks[task_id]
        processor = app.state.audio_processor
        
        # 업로드 완료 상태 표시
        task["status"] = "uploading"
        task["progress"] = 10
        task["message"] = "파일 업로드 완료, 처리 준비 중..."
        await asyncio.sleep(0.5)  # WebSocket이 상태를 전달할 시간 제공
        
        # STT 처리 시작
        task["status"] = "transcribing"
        task["progress"] = 20
        task["message"] = "음성을 텍스트로 변환 중..."
        await asyncio.sleep(0.5)  # WebSocket이 상태를 전달할 시간 제공
        
        # STT 처리 중 진행률 업데이트
        for progress in range(25, 50, 5):
            task["progress"] = progress
            task["message"] = f"음성 인식 진행 중... ({progress}%)"
            await asyncio.sleep(0.3)
        
        transcript = await processor.transcribe_audio(task["file_path"])
        
        # STT 완료
        task["progress"] = 50
        task["message"] = "음성 인식 완료!"
        task["transcript"] = transcript
        await asyncio.sleep(0.5)
        
        # AI 요약 처리 시작
        task["status"] = "summarizing"
        task["progress"] = 55
        task["message"] = "AI로 요약 생성 중..."
        await asyncio.sleep(0.5)
        
        # AI 요약 처리 중 진행률 업데이트
        for progress in range(60, 90, 5):
            task["progress"] = progress
            task["message"] = f"AI 요약 생성 중... ({progress}%)"
            await asyncio.sleep(0.3)
        
        summary = await processor.generate_summary(transcript, task["processing_type"])
        
        # 결과 파일 저장
        task["progress"] = 95
        task["message"] = "결과 파일 저장 중..."
        await asyncio.sleep(0.2)
        
        result_path = f"results/{task_id}.md"
        with open(result_path, "w", encoding="utf-8") as f:
            f.write(summary)
        
        # 완료
        task["status"] = "completed"
        task["progress"] = 100
        task["message"] = "처리 완료!"
        
    except Exception as e:
        processing_tasks[task_id]["status"] = "failed"
        processing_tasks[task_id]["progress"] = 0
        processing_tasks[task_id]["message"] = f"처리 중 오류 발생: {str(e)}"
        print(f"Processing error for task {task_id}: {e}")
        
        # 에러 발생 시 좀 더 구체적인 정보 제공
        if "ffmpeg" in str(e).lower():
            processing_tasks[task_id]["message"] = "FFmpeg 오류: 음성 파일 처리 중 문제가 발생했습니다. 다시 시도해주세요."
        elif "whisper" in str(e).lower() or "model" in str(e).lower():
            processing_tasks[task_id]["message"] = "음성 인식 모델 오류: 오디오 파일을 확인하고 다시 시도해주세요."
        elif "ollama" in str(e).lower():
            processing_tasks[task_id]["message"] = "AI 요약 생성 오류: Ollama 서비스를 확인하고 다시 시도해주세요."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)