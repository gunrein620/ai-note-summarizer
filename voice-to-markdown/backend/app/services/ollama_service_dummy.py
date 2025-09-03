import asyncio
from typing import Optional

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        """
        Ollama 서비스 더미 구현 (테스트용)
        """
        self.base_url = base_url
        self.model_name = "llama3.1:8b"
        
    async def check_model_availability(self) -> bool:
        """모델이 사용 가능한지 확인 (더미)"""
        print("[DUMMY] Checking Ollama model availability...")
        await asyncio.sleep(0.2)
        return True  # 항상 사용 가능하다고 가정
    
    async def generate_summary(self, text: str, content_type: str = "lecture") -> str:
        """
        텍스트를 요약하여 Markdown 형식으로 변환 (더미)
        """
        if not await self.check_model_availability():
            raise Exception("Ollama 모델을 사용할 수 없습니다.")
        
        try:
            print(f"[DUMMY] Generating summary with Ollama for {content_type}")
            
            # AI 처리 시뮬레이션 (더 긴 시간)
            await asyncio.sleep(1.5)  # 초기 분석
            await asyncio.sleep(1.5)  # 요약 생성
            await asyncio.sleep(1)    # 최종 포맷팅
            
            # 더미 요약 생성
            if content_type == "lecture":
                summary = self._generate_dummy_lecture_summary()
            else:  # meeting
                summary = self._generate_dummy_meeting_summary()
            
            print(f"[DUMMY] Summary generated successfully. Length: {len(summary)} characters")
            return summary
                
        except Exception as e:
            print(f"[DUMMY] Summary generation error: {e}")
            raise Exception(f"요약 생성 중 오류가 발생했습니다: {str(e)}")
    
    def _generate_dummy_lecture_summary(self) -> str:
        """강의용 더미 요약"""
        return """## 프로그래밍 기초 강의

### 학습 목표
- 변수의 개념과 사용법 이해
- 함수의 정의와 활용 방법 학습
- 조건문의 구조와 사용 사례 파악

### 주요 내용

#### 1. 변수 (Variables)
- **정의**: 데이터를 저장하는 공간
- **특징**: Python에서는 타입 명시 불필요
- **예시**: `x = 10` (정수), `name = "Python"` (문자열)

#### 2. 함수 (Functions)
- **개념**: 특정 작업을 수행하는 코드의 집합
- **문법**: `def 함수명():` 형태로 정의
- **예시**:
  ```python
  def hello():
      print("안녕하세요!")
  ```

#### 3. 조건문 (Conditional Statements)
- **용도**: 특정 조건에 따른 분기 처리
- **기본 구조**: `if 조건:` 형태
- **예시**: `if x > 5: print("크다")`

### 다음 강의 예고
- **주제**: 반복문 (for, while)
- **일정**: 다음 수업 시간

### 핵심 포인트
1. ✅ 변수는 데이터 저장 공간
2. ✅ 함수는 재사용 가능한 코드 블록
3. ✅ 조건문으로 프로그램 흐름 제어

---
*본 요약은 AI가 자동 생성한 내용입니다.*"""

    def _generate_dummy_meeting_summary(self) -> str:
        """회의용 더미 요약"""
        return """## 팀 프로젝트 회의록

### 회의 기본 정보
- **일시**: 오늘
- **참석자**: 개발팀 전체
- **안건**: 프로젝트 진행 상황 점검

### 주요 논의 사항

#### 1. 현재 진행 상황
- 프론트엔드 개발 80% 완료
- 백엔드 API 개발 진행 중
- 데이터베이스 설계 완료

#### 2. 이슈 및 해결방안
- **이슈**: 일부 API 응답 속도 개선 필요
- **해결방안**: 캐싱 로직 추가 구현 예정

#### 3. 향후 계획
- 다음 주 내 베타 버전 완성 목표
- 사용자 테스트 준비 시작

### 결정 사항
- ✅ 코드 리뷰 프로세스 강화
- ✅ 주간 진행 상황 보고 정례화
- ✅ 테스트 커버리지 80% 이상 유지

### 액션 아이템
- [ ] **김개발**: API 성능 최적화 (마감: 이번 주)
- [ ] **이디자인**: UI/UX 개선사항 정리 (마감: 내일)
- [ ] **박기획**: 사용자 테스트 시나리오 작성 (마감: 금요일)

### 다음 회의
- **일정**: 다음 주 월요일 오전 10시
- **안건**: 베타 버전 데모 및 피드백 수집

---
*본 회의록은 AI가 자동 생성한 내용입니다.*"""