# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Voice-to-Markdown application with a full-stack architecture:

- **Root Level**: Contains the main project with a voice-to-markdown monorepo structure
- **Frontend** (`voice-to-markdown/frontend/`): React + Vite application with Tailwind CSS
- **Backend** (`voice-to-markdown/backend/`): FastAPI Python application with WebSocket support
- **AI Integration**: Uses OpenAI Whisper for speech-to-text and Ollama Llama 3.1 8B for summarization

## Development Commands

### Root Level Commands (Recommended)
```bash
# Install all dependencies (backend Python + frontend npm)
npm run install-all

# Start both backend and frontend concurrently
npm run dev
# or
npm start

# Backend runs on port 8000, frontend on port 5173
```

### Individual Service Commands

**Backend** (from `voice-to-markdown/backend/`):
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

**Frontend** (from `voice-to-markdown/frontend/`):
```bash
# Install npm dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Backend Architecture (`voice-to-markdown/backend/`)
- **FastAPI Application**: Main entry point at `app/main.py`
- **Services Layer**: 
  - `services/processor.py` - Main processing orchestration
  - `services/whisper_service.py` / `whisper_service_dummy.py` - Speech-to-text conversion
  - `services/ollama_service.py` / `ollama_service_dummy.py` - AI summarization
- **Models**: Pydantic schemas in `app/models/schemas.py`
- **WebSocket**: Real-time communication for processing status updates
- **Demo Mode**: Automatically falls back to dummy services when AI models are not installed

### Frontend Architecture (`voice-to-markdown/frontend/src/`)
- **Components**:
  - `AudioRecorder.jsx` - Web Audio API recording functionality
  - `TypeSelector.jsx` - Content type selection (lecture/meeting)
  - `ProcessingStatus.jsx` - Real-time processing status display
  - `ResultViewer.jsx` - Markdown preview and download
- **Services**:
  - `services/api.js` - HTTP API communication
  - `services/websocket.js` - Real-time WebSocket communication
- **Main App**: `App.jsx` orchestrates the entire user flow

### Key Features
- **Dual Mode Operation**: Real AI models or demo mode with dummy data
- **Real-time Processing**: WebSocket-based status updates during processing
- **File Management**: Audio uploads stored in `backend/uploads/`, results in `backend/results/`
- **Web Audio Recording**: Browser-based audio recording without external dependencies

## Development Notes

- The application automatically detects if Whisper and Ollama are installed and switches between real/demo modes
- Backend API documentation available at `http://localhost:8000/docs` (FastAPI Swagger UI)
- Frontend uses Axios for HTTP requests and native WebSocket for real-time communication
- Tailwind CSS is configured for styling with PostCSS and Autoprefixer