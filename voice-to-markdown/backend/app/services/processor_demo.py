import asyncio
import os

# 실제 서비스가 설치되지 않은 경우 더미 서비스 사용
try:
    from .whisper_service import WhisperService
    from .ollama_service import OllamaService
    USE_REAL_SERVICES = True
except ImportError:
    from .whisper_service_dummy import WhisperService
    from .ollama_service_dummy import OllamaService
    USE_REAL_SERVICES = False
    print("[INFO] Using dummy services for demo purposes")

from ..models.schemas import ProcessingType

class AudioProcessor:
    def __init__(self):
        """오디오 처리 서비스 통합 클래스"""
        self.whisper_service = WhisperService(model_size="base")
        self.ollama_service = OllamaService()
        self.use_real_services = USE_REAL_SERVICES
        
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """
        오디오 파일을 텍스트로 변환
        
        Args:
            audio_file_path: 오디오 파일 경로
            
        Returns:
            변환된 텍스트
        """
        try:
            # Whisper를 사용하여 음성 인식
            transcript = await self.whisper_service.transcribe(audio_file_path)
            
            if not transcript or len(transcript.strip()) == 0:
                raise Exception("음성 인식 결과가 비어있습니다. 오디오 파일을 확인해주세요.")
            
            return transcript
            
        except Exception as e:
            print(f"Audio transcription error: {e}")
            raise
    
    async def generate_summary(self, text: str, processing_type: ProcessingType) -> str:
        """
        텍스트를 요약하여 Markdown으로 변환
        
        Args:
            text: 요약할 텍스트
            processing_type: 처리 유형 (lecture 또는 meeting)
            
        Returns:
            Markdown 형식의 요약
        """
        try:
            # Ollama를 사용하여 요약 생성
            summary = await self.ollama_service.generate_summary(
                text, 
                content_type=processing_type.value
            )
            
            if not summary or len(summary.strip()) == 0:
                raise Exception("요약 생성 결과가 비어있습니다.")
            
            # 기본 메타데이터 추가
            metadata = self._generate_metadata(processing_type, len(text))
            final_summary = f"{metadata}\n\n---\n\n{summary}"
            
            return final_summary
            
        except Exception as e:
            print(f"Summary generation error: {e}")
            raise
    
    async def process_audio_complete(self, audio_file_path: str, processing_type: ProcessingType) -> str:
        """
        오디오 파일을 완전히 처리 (STT + 요약)
        
        Args:
            audio_file_path: 오디오 파일 경로
            processing_type: 처리 유형
            
        Returns:
            최종 Markdown 요약
        """
        try:
            print(f"Starting complete audio processing for {processing_type.value}")
            
            # Step 1: 음성 인식
            print("Step 1: Transcribing audio...")
            transcript = await self.transcribe_audio(audio_file_path)
            print(f"Transcription completed. Text length: {len(transcript)} characters")
            
            # Step 2: 요약 생성
            print("Step 2: Generating summary...")
            summary = await self.generate_summary(transcript, processing_type)
            print("Summary generation completed")
            
            return summary
            
        except Exception as e:
            print(f"Complete audio processing error: {e}")
            raise
    
    def _generate_metadata(self, processing_type: ProcessingType, text_length: int) -> str:
        """요약 메타데이터 생성"""
        from datetime import datetime
        
        type_name = "강의" if processing_type == ProcessingType.LECTURE else "회의"
        current_time = datetime.now().strftime("%Y년 %m월 %d일 %H:%M")
        service_mode = "실제 AI 모델" if self.use_real_services else "데모 모드"
        
        return f"""# {type_name} 요약

**생성 일시**: {current_time}  
**처리 유형**: {type_name}  
**원본 텍스트 길이**: {text_length:,} 글자  
**처리 엔진**: {service_mode} (Whisper + Llama 3.1 8B)"""