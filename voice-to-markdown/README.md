

# Voice to Markdown 요약 웹앱

로컬 AI 모델을 활용한 강의 음성 → Markdown 요약 웹앱

## 프로젝트 구조
- **Frontend**: React + Vite (포트 5173)
- **Backend**: Python FastAPI (포트 8000)  
- **AI 모델**: Whisper (STT) + Ollama Llama 3.1 8B (요약/구조화)

## 🚀 빠른 시작 (데모 모드)

### 1. 백엔드 실행
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. 프론트엔드 실행 (새 터미널)
```bash
cd frontend
npm install
npm run dev
```

### 3. 웹 브라우저에서 접속
- 주소: http://localhost:5173
- 백엔드 API: http://localhost:8000

## 🎯 기능
1. **웹 브라우저에서 음성 녹음** - Web Audio API 활용
2. **강의/회의 유형 선택** - 맞춤형 요약 스타일
3. **음성을 텍스트로 변환** - Whisper STT
4. **AI로 구조화된 Markdown 요약 생성** - Llama 3.1 8B
5. **실시간 처리 진행상황 표시** - WebSocket 연결
6. **결과 미리보기 및 다운로드** - Markdown 파일

## 📱 사용자 플로우
```
웹 접속 → 유형 선택 → 녹음 → 처리 → MD 결과 확인/다운로드
```

## 🔧 실제 AI 모델 설정 (선택사항)

### Whisper 설치
```bash
pip install openai-whisper
```

### Ollama 설치 및 모델 다운로드
```bash
# Ollama 설치 (macOS)
brew install ollama

# 모델 다운로드 및 실행
ollama pull llama3.1:8b
ollama run llama3.1:8b
```

실제 AI 모델이 설치되면 자동으로 실제 모델을 사용하고, 설치되지 않은 경우 데모 모드로 실행됩니다.

## 🛠️ 개발 환경
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React-Markdown
- **Backend**: FastAPI, Python 3.9+, WebSocket, Pydantic
- **AI**: OpenAI Whisper, Ollama Llama 3.1 8B
- **기타**: CORS, Multipart upload, Background processing

## 📁 프로젝트 구조
```
voice-to-markdown/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   ├── services/         # API & WebSocket
│   │   └── App.jsx
│   └── package.json
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── main.py          # 메인 애플리케이션
│   │   ├── services/        # AI 서비스 로직
│   │   ├── models/          # 데이터 모델
│   │   └── websockets/      # 실시간 통신
│   ├── requirements.txt
│   ├── uploads/             # 업로드된 오디오 파일
│   └── results/             # 생성된 Markdown 파일
└── README.md
```

## 🎮 데모 모드
- AI 모델이 설치되지 않은 경우 자동으로 데모 모드로 실행
- 더미 데이터로 전체 플로우 테스트 가능
- 실제 녹음은 가능하지만 더미 텍스트로 처리

## ⚡ 성능 최적화
- 비동기 처리로 여러 작업 동시 실행 가능
- WebSocket으로 실시간 상태 업데이트
- 백그라운드 처리로 UI 응답성 유지

## 🔍 API 문서
서버 실행 후 http://localhost:8000/docs 에서 Swagger UI 확인 가능

## 🎯 주요 특징
✅ **로컬 실행** - 데이터가 외부로 전송되지 않음  
✅ **실시간 피드백** - 처리 진행상황 실시간 표시  
✅ **유연한 요약** - 강의/회의 맞춤형 구조화  
✅ **웹 기반** - 별도 앱 설치 불필요  
✅ **오픈소스** - 커스터마이징 가능