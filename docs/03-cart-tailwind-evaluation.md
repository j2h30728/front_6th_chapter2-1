# cart-tailwind.html 종합 평가 보고서

## 평가 개요

본 문서는 작성된 클린코드 가이드라인을 기준으로 `cart-tailwind.html` 파일의 더티코드를 종합적으로 평가합니다.

### 평가 기준

1. 실전 클린코드 가이드 (practical-clean-code-guide.md)
2. 더티코드 분석 기준 (dirty-code-analysis.md)
3. 코드 삭제의 기술 (the-art-of-code-deletion.md)
4. 리팩토링 실습 가이드 (refactoring-exercise-guide.md)

---

## 1. 변수 인접성 원칙 위반 사례

### 🔴 심각도: 매우 높음

#### 대표적인 안티패턴 (calcCart 함수)

```javascript
// 409-433번 줄: 24개의 변수를 상단에 선언
var cartItems, subTot, itemDiscounts, calculationStartTime, isCalculating...

// 440번 줄: 첫 사용 (31줄 떨어짐)
cartItems = cartDisp.children;

// 445번 줄: calculationStartTime 사용 (36줄 떨어짐)
calculationStartTime = performance.now ? performance.now() : Date.now();
```

**문제점**:

- 변수 선언과 사용 사이 평균 거리: **50줄 이상**
- 코드 읽기 시 계속 위아래로 스크롤 필요
- 변수의 용도를 즉시 파악 불가능

#### renderBonusPts 함수의 극단적 사례

```javascript
// 740-741번 줄: 혼란스러운 중복 선언
var hasProducts = { keyboard: false, mouse: false, arm: false };
// 그런데 이미 hasKeyboard, hasMouse 변수도 따로 선언됨

// 765-768번 줄: 불필요한 검증
if (!hasKeyboard) hasKeyboard = hasProducts.keyboard;
```

**평가**: 변수 관리가 전혀 체계적이지 않음

---

## 2. 코드 응집도와 중복

### 🔴 심각도: 매우 높음

#### 포인트 계산 중복 (총 5곳)

1. calcCart 함수 (668-671번 줄)
2. renderBonusPts 함수 (719-733번 줄)
3. calcCart 내부 다시 (684번 줄)
4. addBtn 이벤트 핸들러 (1075-1090번 줄)
5. 즉시 재계산 로직

```javascript
// 패턴 1
pts = Math.floor(totalAmt/1000);
if(new Date().getDay() === 2) pts *= 2;

// 패턴 2
basePoints = Math.floor(totalAmt/1000)
if(new Date().getDay() === 2) finalPoints *= 2;

// 패턴 3 (갑자기 reduce 사용)
var tempTotal = Array.from(cartDisp.children).reduce(...);
```

**문제점**:

- 동일 계산이 최소 5번 반복
- 각각 미묘하게 다른 구현 (일관성 없음)
- 버그 수정 시 모든 곳을 찾아 수정해야 함

---

## 3. 매직 넘버와 하드코딩

### 🟡 심각도: 높음

#### 발견된 매직 넘버

- `10`: 할인 시작 수량 (8곳)
- `30`: 대량구매 기준 (6곳)
- `0.1, 0.15, 0.2, 0.25`: 할인율 (각 3곳 이상)
- `30000, 60000`: 타이머 간격 (의미 불명)
- `5`: 재고 부족 기준 (4곳)

```javascript
if (quantity < 10) return 0; // 10의 의미?
if (itemCnt >= 30) {
} // 30의 의미?
setInterval(function () {}, 30000); // 30초? 의미 불명
```

**평가**: 비즈니스 규칙이 코드 전체에 흩어져 있음

---

## 4. 전역 상태 관리의 혼란

### 🔴 심각도: 매우 높음

#### 전역 변수 목록

```javascript
var prodList, sel, addBtn, cartDisp, sum, stockInfo;
var lastSel,
  bonusPts = 0,
  totalAmt = 0,
  itemCnt = 0;
```

**문제점**:

- 10개 이상의 전역 변수
- 여러 함수에서 직접 수정
- 상태 변경 추적 불가능
- 동시성 문제 발생 가능

#### 상태 불일치 예시

```javascript
// DOM의 수량과 prodList의 재고가 따로 관리
qtyElem.textContent = newQty;
itemToAdd['q']--; // 동기화 안 됨
```

---

## 5. 함수의 과도한 책임

### 🔴 심각도: 매우 높음

#### calcCart 함수 분석

- **총 길이**: 288줄 (408-696번)
- **책임 개수**: 최소 8개
  1. 총액 계산
  2. 할인 적용
  3. 포인트 계산
  4. UI 업데이트 (5곳 이상)
  5. 재고 체크
  6. 통계 수집
  7. DOM 스타일 변경
  8. 로깅

**단일 책임 원칙 위반 지수**: 8/1 = **800%**

---

## 6. 일관성 없는 코딩 스타일

### 🟡 심각도: 높음

#### 변수 선언 방식

```javascript
var prodList, sel, addBtn; // var, 콤마 구분
const PRODUCT_ONE = 'p1'; // const, 대문자
let p4 = 'p4'; // let, 쌍따옴표
productFive = `p5`; // 템플릿 리터럴
```

#### 반복문 사용

```javascript
// 총 5가지 다른 방식
for (var i = 0; i < length; i++) {}
prodList.forEach((p) => {});
while (idx < nodes.length) {}
for (const node of nodes) {
}
Array.from().reduce();
```

**평가**: 마치 여러 사람이 작성한 것처럼 일관성 없음

---

## 7. 삭제 가능성 평가

### 🔴 삭제 난이도: 매우 높음

#### 삭제하기 어려운 이유

1. **전역 의존성**: 모든 함수가 전역 변수에 의존
2. **숨겨진 부작용**: DOM 조작이 곳곳에 숨어있음
3. **불명확한 경계**: 어디서 시작하고 끝나는지 불명확
4. **중복 코드**: 삭제하면 다른 곳도 수정 필요

#### 예시: updateSelOpts 함수

```javascript
function updateSelOpts() {
  sel.innerHTML = '';        // 전역 변수 직접 조작
  prodList.forEach(...)      // 전역 변수 의존
  sel.style.borderColor = '' // DOM 직접 수정
}
```

**평가**: 함수 하나를 삭제하려면 전체를 다시 작성해야 함

---

## 8. 에러 처리와 안정성

### 🟡 심각도: 중간

#### 발견된 문제

```javascript
// null 체크 누락
var totalDiv = sum.querySelector('.text-2xl');
totalDiv.textContent = '₩' + Math.round(totalAmt); // totalDiv가 null이면?

// 배열 접근 시 경계 체크 없음
var luckyItem = prodList[luckyIdx]; // prodList가 비어있으면?
```

**평가**: 런타임 에러 발생 가능성 높음

---

## 9. 성능 문제

### 🟡 심각도: 중간

#### 비효율적인 패턴

1. **반복적인 DOM 조작**

   ```javascript
   summaryDetails.innerHTML += `...`; // 매번 전체 재렌더링
   ```

2. **불필요한 재계산**

   ```javascript
   new Date().getDay() === 2; // 여러 번 호출
   ```

3. **메모리 누수 가능성**
   ```javascript
   window.analyticsData.push(cartAnalytics); // 무한정 증가
   ```

---

## 10. 테스트 가능성

### 🔴 테스트 난이도: 불가능

#### 테스트를 방해하는 요소

1. **전역 상태 의존**: 격리된 테스트 불가능
2. **DOM 직접 조작**: 모킹 어려움
3. **비순수 함수**: 부작용으로 가득
4. **시간 의존성**: `new Date()`, `setTimeout`
5. **랜덤 요소**: `Math.random()`

---

## 종합 평가

### 점수표 (100점 만점)

| 평가 항목     | 점수       | 설명                           |
| ------------- | ---------- | ------------------------------ |
| 가독성        | 15/100     | 변수명, 구조, 흐름 모두 불명확 |
| 유지보수성    | 10/100     | 한 곳 수정 시 전체 영향        |
| 테스트 가능성 | 5/100      | 사실상 테스트 불가능           |
| 확장성        | 10/100     | 새 기능 추가 매우 어려움       |
| 성능          | 30/100     | 기능은 하지만 비효율적         |
| **총점**      | **14/100** | **F등급**                      |

### 주요 개선 필요 사항

#### 즉시 개선 (Critical)

1. 전역 변수 제거 → 모듈 패턴 적용
2. calcCart 함수 분리 → 10개 이상의 작은 함수로
3. 중복 코드 통합 → DRY 원칙 적용

#### 단기 개선 (High)

1. 매직 넘버 → 명명된 상수로
2. 일관된 코딩 스타일 적용
3. 에러 처리 추가

#### 장기 개선 (Medium)

1. 테스트 코드 작성
2. TypeScript 마이그레이션
3. 컴포넌트 기반 아키텍처

---

## 학습 포인트

### 이 코드가 주는 교훈

1. **작은 시작의 중요성**
   - 처음에는 간단했을 코드가 어떻게 괴물이 되는가
   - 리팩토링 없이 기능만 추가하면 발생하는 일

2. **전역 변수의 위험성**
   - 전역 변수 하나가 전체 코드를 오염시킴
   - 상태 추적의 불가능성

3. **일관성의 가치**
   - 일관성 없는 코드는 읽기도, 수정하기도 어려움
   - 팀 작업 시 더욱 중요

4. **테스트의 필요성**
   - 테스트 없이 리팩토링은 도박
   - 테스트 가능한 구조의 중요성

### AI 시대의 시사점

이런 더티코드는 AI가 생성하기 쉬운 패턴입니다:

- 동작은 하지만 구조가 엉망
- 복사-붙여넣기 스타일
- 전체적인 설계 없이 부분만 해결

**결론**: AI가 생성한 코드도 이런 관점에서 검토해야 합니다.

---

## 리팩토링 로드맵

### Phase 1: 긴급 수술 (1주)

```javascript
// Before
var prodList, sel, addBtn, cartDisp, sum, stockInfo;

// After
const ShoppingCart = (() => {
  let state = { products: [], cart: [] };
  return {
    /* public API */
  };
})();
```

### Phase 2: 구조 개선 (2주)

- 비즈니스 로직 분리
- UI 렌더링 분리
- 이벤트 핸들링 정리

### Phase 3: 현대화 (3주)

- ES6+ 문법 적용
- 모듈 시스템 도입
- 테스트 코드 작성

### 예상 결과

- 코드 라인 수: 1,168줄 → 약 600줄 (50% 감소)
- 함수 개수: 8개 → 약 30개 (적절한 크기로 분할)
- 테스트 커버리지: 0% → 80% 이상

---

## 최종 평가

이 코드는 **"클린코드가 왜 중요한가"를 가르치기 위한 완벽한 반면교사**입니다.
거의 모든 안티패턴을 포함하고 있어, 학습 자료로서의 가치는 매우 높습니다.

> "이 코드를 개선할 수 있다면, 어떤 레거시 코드도 두렵지 않을 것입니다."
