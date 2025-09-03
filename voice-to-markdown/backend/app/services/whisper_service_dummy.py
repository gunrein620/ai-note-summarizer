import os
from typing import Optional
import time
import asyncio

class WhisperService:
    def __init__(self, model_size: str = "base"):
        """
        Whisper 서비스 더미 구현 (테스트용)
        """
        self.model_size = model_size
        self.model = None
        
    async def load_model(self):
        """Whisper 모델 로드 (더미)"""
        if self.model is None:
            print(f"[DUMMY] Loading Whisper model: {self.model_size}")
            await asyncio.sleep(0.5)  # 모델 로딩 시뮬레이션
            self.model = "dummy_model"
            print("[DUMMY] Whisper model loaded successfully")
    
    async def transcribe(self, audio_file_path: str, language: str = "ko") -> str:
        """
        오디오 파일을 텍스트로 변환 (더미)
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        await self.load_model()
        
        try:
            print(f"[DUMMY] Transcribing audio file: {audio_file_path}")
            
            # 더미 음성 인식 시뮬레이션
            await asyncio.sleep(2)  # 처리 시뮬레이션
            
            # 더미 텍스트 반환 (강의/회의 예시)
            dummy_transcript = """
            안녕하세요, 오늘은 프로그래밍 기초에 대해서 알아보겠습니다. 
            먼저 변수의 개념부터 시작해보겠습니다. 변수는 데이터를 저장하는 공간이라고 할 수 있습니다.
            파이썬에서는 변수를 선언할 때 타입을 명시하지 않아도 됩니다. 예를 들어 x = 10 이라고 하면 x라는 변수에 10이라는 정수값이 저장됩니다.
            
            다음으로 함수에 대해 알아보겠습니다. 함수는 특정 작업을 수행하는 코드의 집합입니다.
            def hello()와 같이 정의할 수 있고, 이 함수를 호출하면 정의된 작업이 실행됩니다.
            
            마지막으로 조건문에 대해 설명드리겠습니다. if 문을 사용하여 특정 조건에 따라 다른 동작을 수행할 수 있습니다.
            if x > 5: print("크다") 와 같이 사용할 수 있습니다.
            
            오늘 수업은 여기서 마치겠습니다. 다음 시간에는 반복문에 대해 알아보겠습니다.
            """.strip()
            
            print(f"[DUMMY] Transcription completed. Length: {len(dummy_transcript)} characters")
            
            return dummy_transcript
            
        except Exception as e:
            print(f"[DUMMY] Transcription error: {e}")
            raise Exception(f"음성 인식 중 오류가 발생했습니다: {str(e)}")
    
    def get_supported_languages(self):
        """지원되는 언어 목록 반환 (더미)"""
        return {"ko": "Korean", "en": "English"}