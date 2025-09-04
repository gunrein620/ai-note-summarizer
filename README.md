# 🤖 AI 필기노트 (Voice-to-Markdown)

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **음성을 AI로 구조화된 Markdown 요약으로 변환하는 웹 애플리케이션**

회의, 강의, 인터뷰 등 모든 음성 컨텐츠를 실시간으로 텍스트로 변환하고 AI가 자동으로 구조화된 마크다운 노트를 생성해줍니다.

## ✨ 주요 기능

### 🎤 **다양한 입력 방식**
- **실시간 음성 녹음**: 브라우저에서 바로 녹음
- **파일 업로드**: 기존 오디오/비디오 파일 업로드 지원
- **지원 형식**: MP3, WAV, WebM, M4A, MP4, AAC, OGG, FLAC

### 🤖 **AI 기반 처리**
- **고정밀 음성 인식**: OpenAI Whisper 모델 사용
- **지능형 요약**: Llama 3.1 8B 모델로 컨텍스트 기반 요약
- **맞춤형 처리**: 강의, 회의, 인터뷰 등 컨텐츠 타입별 최적화

### 📱 **사용자 친화적 인터페이스**
- **반응형 웹 디자인**: 모바일/데스크톱 완벽 지원
- **실시간 진행률**: WebSocket 기반 실시간 상태 업데이트
- **다크 테마**: 세련된 그라디언트 디자인
- **QR 코드**: 모바일 접근을 위한 ngrok 터널링

### 📝 **구조화된 출력**
- **Markdown 형식**: 읽기 쉬운 구조화된 문서
- **실시간 미리보기**: 처리 과정에서 텍스트 실시간 확인
- **다운로드 지원**: 완성된 요약 파일 다운로드

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18+ 
- **Python** 3.8+
- **FFmpeg** (음성 처리용)
- **ngrok** (모바일 접근용, 선택사항)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd AI-note/voice-to-markdown
```

2. **의존성 설치**
```bash
npm run install-all
```

3. **서버 시작**

**개발 모드 (로컬만)**
```bash
npm run start:simple
```

**ngrok 포함 (모바일 접근 가능)**
```bash
npm start
```

4. **접속**
- **로컬**: http://localhost:5173
- **모바일**: QR 코드 스캔 또는 ngrok URL 사용

## 📁 프로젝트 구조

```
voice-to-markdown/
├── 📁 backend/          # FastAPI 백엔드
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
├── 📁 frontend/         # React 프론트엔드
│   ├── src/
│   │   ├── components/  # UI 컴포넌트
│   │   │   ├── AudioRecorder.jsx     # 음성 녹음
│   │   │   ├── FileUploader.jsx      # 파일 업로드
│   │   │   ├── ProcessingStatus.jsx  # 진행 상태
│   │   │   └── ResultViewer.jsx      # 결과 보기
│   │   └── services/    # API 통신
│   └── public/
└── 📁 scripts/          # 유틸리티 스크립트
```

## 🛠 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Whisper**: OpenAI 음성 인식 모델
- **Ollama**: 로컬 LLM 추론 엔진
- **WebSockets**: 실시간 상태 업데이트
- **uvicorn**: ASGI 서버

### Frontend  
- **React 18**: 모던 UI 라이브러리
- **Vite**: 빠른 빌드 도구
- **Tailwind CSS**: 유틸리티 CSS 프레임워크
- **Axios**: HTTP 클라이언트

### DevOps
- **Docker**: 컨테이너화 (향후 지원)
- **ngrok**: 터널링 서비스
- **concurrently**: 멀티 프로세스 관리

## 🎯 사용 방법

### 1. 처리 타입 선택
- **강의**: 학술적 내용, 구조화된 설명
- **회의**: 비즈니스 미팅, 결정사항 중심
- **인터뷰**: Q&A 형식, 대화 중심

### 2. 음성 입력
- **녹음**: 마이크 버튼 클릭 후 실시간 녹음
- **업로드**: 기존 오디오/비디오 파일 드래그 앤 드롭

### 3. AI 처리 과정
1. **음성 인식** (STT): Whisper로 텍스트 변환
2. **AI 요약**: Llama 3.1로 구조화된 요약 생성
3. **마크다운 생성**: 읽기 쉬운 문서 형태로 출력

### 4. 결과 확인
- **실시간 미리보기**: 처리 중 텍스트 확인
- **마크다운 다운로드**: 완성된 문서 저장

## ⚙️ 설정

### 환경 변수
```bash
# backend/.env (선택사항)
OPENAI_API_KEY=your_openai_key  # Whisper API 사용시
OLLAMA_HOST=http://localhost:11434  # Ollama 서버 주소
```

### Ollama 모델 설치
```bash
# Llama 3.1 8B 모델 설치
ollama pull llama3.1:8b
```

### FFmpeg 설치
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# https://ffmpeg.org/download.html 에서 다운로드
```

## 🔧 고급 사용법

### 개발 모드
```bash
# 백엔드만 실행
cd backend && uvicorn app.main:app --reload --port 8000

# 프론트엔드만 실행  
cd frontend && npm run dev

# 전체 개발 서버 (동시 실행)
npm run dev
```

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
cd frontend && npm run build

# 백엔드 프로덕션 실행
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- [OpenAI Whisper](https://github.com/openai/whisper) - 고정밀 음성 인식
- [Ollama](https://ollama.ai) - 로컬 LLM 추론
- [FastAPI](https://fastapi.tiangolo.com) - 현대적 웹 API 프레임워크
- [React](https://reactjs.org) - 사용자 인터페이스 라이브러리

---

<div align="center">

**🎤 → 📝 → 🤖 → 📋**

*음성에서 구조화된 노트까지, 한 번에!*

</div>
