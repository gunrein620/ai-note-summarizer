import whisper
import os
import subprocess
import shutil
from typing import Optional

class WhisperService:
    def __init__(self, model_size: str = "base"):
        """
        Whisper 서비스 초기화
        model_size: tiny, base, small, medium, large
        """
        self.model_size = model_size
        self.model = None
        self.ffmpeg_path = self._find_ffmpeg_path()
        
    async def load_model(self):
        """Whisper 모델 로드"""
        if self.model is None:
            print(f"Loading Whisper model: {self.model_size}")
            self.model = whisper.load_model(self.model_size)
            print("Whisper model loaded successfully")
    
    async def transcribe(self, audio_file_path: str, language: str = "ko") -> str:
        """
        오디오 파일을 텍스트로 변환
        
        Args:
            audio_file_path: 오디오 파일 경로
            language: 언어 코드 (ko: 한국어, en: 영어)
        
        Returns:
            변환된 텍스트
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        await self.load_model()
        
        # FFmpeg 경로 설정
        if self.ffmpeg_path:
            os.environ['PATH'] = f"{os.path.dirname(self.ffmpeg_path)}:{os.environ.get('PATH', '')}"
            print(f"Using FFmpeg at: {self.ffmpeg_path}")
        else:
            raise Exception("FFmpeg를 찾을 수 없습니다. brew install ffmpeg로 설치해주세요.")
        
        try:
            print(f"Transcribing audio file: {audio_file_path}")
            
            # Whisper로 음성 인식
            result = self.model.transcribe(
                audio_file_path,
                language=language,
                task="transcribe"
            )
            
            transcript = result["text"].strip()
            print(f"Transcription completed. Length: {len(transcript)} characters")
            
            return transcript
            
        except Exception as e:
            print(f"Transcription error: {e}")
            raise Exception(f"음성 인식 중 오류가 발생했습니다: {str(e)}")
    
    def _find_ffmpeg_path(self) -> Optional[str]:
        """FFmpeg 실행파일 경로를 찾습니다"""
        # 일반적인 FFmpeg 설치 경로들
        common_paths = [
            "/opt/homebrew/bin/ffmpeg",     # Apple Silicon Mac Homebrew
            "/usr/local/bin/ffmpeg",        # Intel Mac Homebrew
            "/usr/bin/ffmpeg",              # Linux 시스템 경로
            shutil.which("ffmpeg")          # PATH에서 찾기
        ]
        
        for path in common_paths:
            if path and os.path.exists(path) and os.path.isfile(path):
                print(f"Found FFmpeg at: {path}")
                return path
        
        print("FFmpeg not found in common paths")
        return None
    
    def get_supported_languages(self):
        """지원되는 언어 목록 반환"""
        return whisper.tokenizer.LANGUAGES