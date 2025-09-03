import requests
import json
from typing import Optional

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        """
        Ollama 서비스 초기화
        
        Args:
            base_url: Ollama 서버 URL
        """
        self.base_url = base_url
        self.model_name = "llama3.1:8b"
        
    async def check_model_availability(self) -> bool:
        """모델이 사용 가능한지 확인"""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return any(model["name"].startswith("llama3.1") for model in models)
            return False
        except Exception as e:
            print(f"Error checking Ollama availability: {e}")
            return False
    
    async def generate_summary(self, text: str, content_type: str = "lecture") -> str:
        """
        텍스트를 요약하여 Markdown 형식으로 변환
        
        Args:
            text: 요약할 텍스트
            content_type: "lecture" 또는 "meeting"
        
        Returns:
            Markdown 형식의 요약
        """
        if not await self.check_model_availability():
            raise Exception("Ollama 모델을 사용할 수 없습니다. 'ollama run llama3.1:8b' 명령으로 모델을 실행해주세요.")
        
        # 프롬프트 템플릿 선택
        if content_type == "lecture":
            prompt = self._get_lecture_prompt(text)
        else:  # meeting
            prompt = self._get_meeting_prompt(text)
        
        try:
            print(f"Generating summary with Ollama for {content_type}")
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 2048
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=300  # 5분 타임아웃
            )
            
            if response.status_code == 200:
                result = response.json()
                summary = result.get("response", "").strip()
                
                if summary:
                    print(f"Summary generated successfully. Length: {len(summary)} characters")
                    return summary
                else:
                    raise Exception("빈 응답을 받았습니다.")
            else:
                raise Exception(f"Ollama API 오류: {response.status_code} - {response.text}")
                
        except requests.exceptions.Timeout:
            raise Exception("요약 생성 시간이 초과되었습니다. 다시 시도해주세요.")
        except Exception as e:
            print(f"Summary generation error: {e}")
            raise Exception(f"요약 생성 중 오류가 발생했습니다: {str(e)}")
    
    def _get_lecture_prompt(self, text: str) -> str:
        """강의용 프롬프트 템플릿"""
        return f"""다음은 강의 내용을 음성 인식으로 변환한 텍스트입니다. 이를 체계적으로 정리하여 Markdown 형식의 강의 노트로 만들어주세요.

# 요구사항:
1. 주요 개념과 핵심 내용을 중심으로 구조화
2. 계층적 헤딩 사용 (##, ###, #### 등)
3. 중요한 키워드는 **굵게** 표시
4. 필요한 경우 리스트나 표 형식 활용
5. 예시나 설명이 있다면 별도 섹션으로 구분
6. 한국어로 자연스럽게 정리

강의 내용:
{text}

위 내용을 바탕으로 체계적인 강의 노트를 Markdown 형식으로 작성해주세요:"""

    def _get_meeting_prompt(self, text: str) -> str:
        """회의용 프롬프트 템플릿"""
        return f"""다음은 회의 내용을 음성 인식으로 변환한 텍스트입니다. 이를 체계적으로 정리하여 Markdown 형식의 회의록으로 만들어주세요.

# 요구사항:
1. 회의의 주요 안건과 논의 사항을 중심으로 구조화
2. 결정 사항과 액션 아이템을 명확히 구분
3. 참여자별 발언 내용이 명확한 경우 정리
4. 계층적 헤딩 사용 (##, ###, #### 등)
5. 중요한 결정사항은 **굵게** 표시
6. 액션 아이템은 체크리스트 형태로 표시
7. 한국어로 자연스럽게 정리

회의 내용:
{text}

위 내용을 바탕으로 체계적인 회의록을 Markdown 형식으로 작성해주세요:"""