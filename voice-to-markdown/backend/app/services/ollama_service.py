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

학생이 직접 필기한 것처럼 상세하고 완전한 강의 노트를 작성해주세요.

# 작성 원칙:
1. **내용 보존**: 원본 강의의 모든 중요 내용을 빠짐없이 포함
   - 핵심 개념뿐만 아니라 부연 설명, 예시, 세부사항도 모두 기록
   - 교수님이 언급한 팁, 주의사항, 강조 포인트 반드시 포함
   - "시험에 나올 수 있다", "중요하다" 등의 언급은 특별 표시

2. **오류 수정**: STT 변환 과정의 오류를 문맥에 맞게 자연스럽게 수정
   - 잘못 인식된 전문용어나 고유명사 교정
   - 문장 부호와 띄어쓰기 정리
   - 의미가 불분명한 부분은 문맥으로 추론하여 보완

3. **구조화 방식**:
   - 계층적 헤딩 사용 (##, ###, ####)
   - 핵심 키워드와 용어는 **굵게** 표시
   - 정의나 공식은 > 인용 블록으로 강조
   - 예시는 - 또는 번호 리스트로 정리
   - 관련 내용끼리 논리적으로 그룹화

4. **추가 요소**:
   - 📌 중요 표시: 시험 출제 가능성이 높거나 특별히 강조된 내용
   - 💡 팁/참고: 교수님이 언급한 추가 설명이나 학습 팁
   - ⚠️ 주의사항: 실수하기 쉬운 부분이나 주의점
   - 📝 예제: 구체적인 예시나 문제

5. **상세도**: 
   - 나중에 이 노트만 보고도 강의 내용을 완전히 이해할 수 있도록 상세히 작성
   - 암기가 필요한 부분은 별도로 정리
   - 이해를 돕는 부연 설명 포함

원본 텍스트:
{text}

---

위 강의 내용을 바탕으로 학생이 수업을 들으며 꼼꼼히 필기한 것처럼 
완전하고 상세한 강의 노트를 작성해주세요. 
내용을 요약하거나 생략하지 말고, 최대한 풍부하게 작성해주세요:"""

    def _get_meeting_prompt(self, text: str) -> str:
        """회의용 프롬프트 템플릿"""
        return f"""다음은 회의 내용을 음성 인식으로 변환한 텍스트입니다. 이를 체계적으로 정리하여 Markdown 형식의 회의록으로 만들어주세요.

# 중요 지시사항:
- 이것은 회의록입니다. "강의"라는 단어를 절대 사용하지 마세요.
- 반드시 "회의록", "회의 내용", "논의 사항" 등의 회의 관련 용어만 사용하세요.

# 요구사항:
1. 회의의 주요 안건과 논의 사항을 중심으로 구조화
2. 결정 사항과 액션 아이템을 명확히 구분
3. 참여자별 발언 내용이 명확한 경우 정리
4. 계층적 헤딩 사용 (## 회의 안건, ### 주요 논의사항, #### 세부 내용 등)
5. 중요한 결정사항은 **굵게** 표시
6. 액션 아이템은 체크리스트 형태로 표시
7. 한국어로 자연스럽게 정리
8. 제목은 "# 회의록" 또는 "## 회의 내용" 형태로 시작

회의 내용:
{text}

위 내용을 바탕으로 체계적인 **회의록**을 Markdown 형식으로 작성해주세요:"""