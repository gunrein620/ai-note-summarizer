# AI 필기노트 (Voice-to-Markdown)

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org)

음성을 텍스트로 변환하고 AI가 구조화된 마크다운 노트로 정리해주는 웹 애플리케이션입니다.

회의, 강의 등의 음성 컨텐츠를 업로드하거나 실시간으로 녹음하면, Whisper로 텍스트 변환 후 Llama 3.1 모델이 자동으로 요약하여 마크다운 문서를 생성합니다.

## 주요 기능

### 다양한 입력 방식
- 브라우저에서 바로 실시간 음성 녹음
- 기존 오디오/비디오 파일 업로드 지원
- 지원 형식: MP3, WAV, WebM, M4A, MP4, AAC, OGG, FLAC

### AI 기반 처리
- 로컬 Whisper 모델을 사용한 음성 인식 (API 비용 없음)
- Ollama + Llama 3.1 8B 로컬 모델로 요약 생성 (완전 무료)
- 강의, 회의 타입별 최적화된 프롬프트
- 모델 다운로드 후 오프라인으로 동작 가능

### 사용자 인터페이스
- 모바일/데스크톱 반응형 웹 디자인
- WebSocket 기반 실시간 처리 상태 업데이트
- ngrok 터널링을 통한 모바일 접근 (QR 코드 제공)

### 출력 기능
- Markdown 형식의 구조화된 문서 생성
- 처리 과정 중 실시간 텍스트 미리보기
- 완성된 마크다운 파일 다운로드

## 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- Python 3.8 이상
- FFmpeg (음성 파일 처리)
- Ollama (로컬 AI 모델 실행)
- ngrok (모바일 접근용, 선택사항)

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd AI-note
```

### 2단계: FFmpeg 설치

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# https://ffmpeg.org/download.html 에서 다운로드 후 PATH 등록
```

### 3단계: Ollama 설치 및 모델 다운로드

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# https://ollama.com/download 에서 다운로드

# Llama 3.1 8B 모델 다운로드 (약 4.7GB)
ollama pull llama3.1:8b

# Ollama 서버 시작 (별도 터미널에서 실행)
ollama serve
```

### 4단계: 프로젝트 의존성 설치

```bash
# voice-to-markdown 디렉토리로 이동
cd voice-to-markdown

# 백엔드 Python 패키지 + 프론트엔드 npm 패키지 일괄 설치
npm run install-all
```

위 명령어는 다음을 자동으로 실행합니다:
- `pip install -r backend/requirements.txt` (FastAPI, Whisper 등)
- `cd frontend && npm install` (React, Vite 등)

### 5단계: 서버 실행

**옵션 1: 로컬 개발 모드 (PC만 접근)**
```bash
npm run start:simple
```

**옵션 2: ngrok 모드 (모바일 접근 가능)**
```bash
# ngrok 설치 (선택사항)
brew install ngrok  # macOS
# 또는 https://ngrok.com/download

npm start
```

서버가 정상적으로 시작되면:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- ngrok 사용 시: QR 코드가 터미널에 표시됩니다

### 6단계: 접속

- PC 브라우저: `http://localhost:5173`
- 모바일: ngrok URL 또는 QR 코드 스캔
- API 문서: `http://localhost:8000/docs` (Swagger UI)

### 데모 모드

Whisper나 Ollama가 설치되지 않은 경우, 자동으로 데모 모드로 동작합니다. 실제 AI 처리를 원하면 3단계를 완료하세요.

## 비용 정보

이 프로젝트는 완전 무료로 사용 가능합니다:
- OpenAI API 사용하지 않음 (로컬 Whisper 모델 사용)
- 로컬에서 Ollama를 통해 LLM 실행
- 모델 설치 후 오프라인으로 동작 (모든 처리가 로컬에서 진행)
- API 키, 회원가입, 결제 없음

### 시스템 요구사항
- 메모리: 최소 8GB RAM (Llama 3.1 8B 모델용)
- 저장공간: 약 5GB (Whisper + Llama 모델 파일)
- CPU: 멀티코어 권장 (AI 처리 속도 향상)

## 프로젝트 구조

```
voice-to-markdown/
├── backend/             # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py      # API 서버 메인
│   │   ├── models/      # 데이터 모델
│   │   ├── services/    # 비즈니스 로직
│   │   │   ├── whisper_service.py    # 음성 인식
│   │   │   ├── ollama_service.py     # AI 요약
│   │   │   └── processor.py          # 통합 처리
│   │   └── websockets/  # 실시간 통신
│   ├── uploads/         # 업로드된 파일
│   └── results/         # 생성된 마크다운
├── frontend/            # React 프론트엔드
│   ├── src/
│   │   ├── components/  # UI 컴포넌트
│   │   │   ├── AudioRecorder.jsx     # 음성 녹음
│   │   │   ├── FileUploader.jsx      # 파일 업로드
│   │   │   ├── TypeSelector.jsx      # 타입 선택
│   │   │   ├── ProcessingStatus.jsx  # 진행 상태
│   │   │   └── ResultViewer.jsx      # 결과 보기
│   │   └── services/    # API 통신
│   └── public/
└── scripts/             # 유틸리티 스크립트
```

## 기술 스택

### Backend
- FastAPI: 고성능 Python 웹 프레임워크
- Whisper: 로컬 음성 인식 모델 (openai-whisper 패키지)
- Ollama: 로컬 LLM 추론 엔진 (Llama 3.1 8B)
- WebSockets: 실시간 상태 업데이트
- uvicorn: ASGI 서버

### Frontend
- React 18: 모던 UI 라이브러리
- Vite: 빠른 빌드 도구
- Tailwind CSS: 유틸리티 CSS 프레임워크
- Axios: HTTP 클라이언트

### DevOps
- ngrok: 터널링 서비스
- concurrently: 멀티 프로세스 관리

## 사용 방법

### 1. 처리 타입 선택
- 강의: 학술적 내용, 구조화된 설명
- 회의: 비즈니스 미팅, 결정사항 중심

### 2. 음성 입력
- 녹음: 마이크 버튼 클릭 후 실시간 녹음
- 업로드: 기존 오디오/비디오 파일 드래그 앤 드롭

### 3. AI 처리 과정
1. 음성 인식 (STT): Whisper로 텍스트 변환
2. AI 요약: Llama 3.1로 구조화된 요약 생성
3. 마크다운 생성: 읽기 쉬운 문서 형태로 출력

### 4. 결과 확인
- 실시간 미리보기: 처리 중 텍스트 확인
- 마크다운 다운로드: 완성된 문서 저장

## 설정

### 환경 변수 (선택사항)

`backend/.env` 파일을 생성하여 설정할 수 있습니다:

```bash
OLLAMA_HOST=http://localhost:11434  # Ollama 서버 주소 (기본값)
WHISPER_MODEL_SIZE=medium          # Whisper 모델 크기 (tiny, base, small, medium, large)
```

## 개발 및 프로덕션

### 개별 서비스 실행

백엔드만 실행:
```bash
cd voice-to-markdown/backend
uvicorn app.main:app --reload --port 8000
```

프론트엔드만 실행:
```bash
cd voice-to-markdown/frontend
npm run dev
```

백엔드 + 프론트엔드 동시 실행:
```bash
cd voice-to-markdown
npm run dev
```

### 프로덕션 빌드

프론트엔드 빌드:
```bash
cd voice-to-markdown/frontend
npm run build
```

백엔드 프로덕션 실행:
```bash
cd voice-to-markdown/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 참고 자료

- [OpenAI Whisper](https://github.com/openai/whisper) - 고정밀 음성 인식
- [Ollama](https://ollama.ai) - 로컬 LLM 추론
- [FastAPI](https://fastapi.tiangolo.com) - 웹 API 프레임워크
- [React](https://reactjs.org) - 사용자 인터페이스 라이브러리
