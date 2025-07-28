# 클린코드와 리팩토링: AI 시대의 코드 품질 판단 능력

## 서론: AI가 코딩하는 시대, 왜 클린코드를 알아야 하는가?

### 1. AI 시대의 개발자 역할 변화

- **코드 작성자 → 코드 큐레이터**: AI가 생성한 코드의 품질을 판단하고 개선
- **문제 해결자 → 아키텍트**: 전체적인 구조와 설계를 이해하고 지시
- **디버거 → 코드 리뷰어**: 더 많은 코드를 빠르게 검토하고 평가

### 2. 클린코드 분별 능력의 중요성

- AI는 동작하는 코드를 만들 수 있지만, 유지보수하기 좋은 코드인지는 별개
- 기술 부채를 조기에 발견하고 예방하는 능력 필요
- 팀 협업과 장기적인 프로젝트 성공을 위한 필수 역량

## Part 1: 더티코드의 징후 식별하기

### 1.1 전역 상태 관리의 문제점

#### 안티패턴 예시

```javascript
// ❌ 나쁜 예: cart-tailwind.html에서
var prodList, sel, addBtn, cartDisp, sum, stockInfo;
var lastSel,
  bonusPts = 0,
  totalAmt = 0,
  itemCnt = 0;
```

#### 문제점

- **예측 불가능성**: 어디서든 값이 변경될 수 있음
- **테스트 어려움**: 전역 상태 때문에 격리된 테스트 불가능
- **동시성 문제**: 여러 함수가 동시에 접근하면 예상치 못한 결과

#### 클린코드 원칙

```javascript
// ✅ 좋은 예: 상태를 캡슐화
class ShoppingCart {
  #items = [];
  #totalAmount = 0;

  addItem(product, quantity) {
    // 명확한 인터페이스를 통한 상태 변경
  }
}
```

### 1.2 네이밍의 중요성

#### 안티패턴 예시

```javascript
// ❌ 나쁜 예
var p, q, amt, sel, tgt;
const PRODUCT_ONE = 'p1',
  PRODUCT_TWO = 'p2',
  p3_id = 'p3';
let p4 = 'p4',
  productFive = `p5`; // 일관성 없는 선언과 네이밍
```

#### 클린코드 원칙

- **의미 있는 이름 사용**: `p` → `product`, `q` → `quantity`
- **일관된 네이밍 컨벤션**: camelCase 또는 snake_case 중 하나만
- **검색 가능한 이름**: 약어보다는 전체 단어 사용

### 1.3 함수의 단일 책임 원칙

#### 안티패턴 예시

```javascript
// ❌ calcCart 함수가 너무 많은 일을 함
function calcCart() {
  // 1. 총액 계산
  // 2. 할인 적용
  // 3. 포인트 계산
  // 4. UI 업데이트
  // 5. 재고 체크
  // 6. 통계 수집
  // ... 351줄부터 560줄까지!
}
```

#### 클린코드 원칙

```javascript
// ✅ 각 함수는 하나의 일만
function calculateSubtotal(items) {}
function applyDiscounts(subtotal, discountRules) {}
function calculatePoints(amount, bonusRules) {}
function updateUI(cartState) {}
```

## Part 2: 코드 중복과 DRY 원칙

### 2.1 중복 코드의 문제점

#### 안티패턴 예시

```javascript
// ❌ 포인트 계산이 여러 곳에 중복
// calcCart() 함수 내부
var pts = Math.floor(totalAmt / 1000);
if (new Date().getDay() === 2) pts *= 2;

// renderBonusPts() 함수 내부
var basePoints = Math.floor(totalAmt / 1000);
if (new Date().getDay() === 2) finalPoints *= 2;

// addBtn 이벤트 핸들러 내부
var tempTotal = 0;
for (var i = 0; i < cartDisp.children.length; i++) {
  // 또 다른 중복 계산...
}
```

#### 해결 방법

- **추출(Extract)**: 중복 로직을 별도 함수로
- **추상화**: 공통 패턴을 찾아 일반화
- **모듈화**: 관련 기능을 하나의 모듈로

### 2.2 매직 넘버와 매직 스트링

#### 안티패턴 예시

```javascript
// ❌ 의미를 알 수 없는 숫자들
if(quantity < 10) return 0;
if(productId === 'p1') return 0.1;
totalAmt *= (1 - 0.1);  // 0.1이 뭘 의미하는지?
if(itemCnt >= 30) {     // 30은 왜?
```

#### 클린코드 원칙

```javascript
// ✅ 상수로 의미 부여
const DISCOUNT_THRESHOLD = 10;
const BULK_PURCHASE_THRESHOLD = 30;
const TUESDAY_DISCOUNT_RATE = 0.1;
const PRODUCT_DISCOUNTS = {
  KEYBOARD: 0.1,
  MOUSE: 0.15,
  MONITOR_ARM: 0.2,
};
```

## Part 3: 구조와 아키텍처

### 3.1 관심사의 분리 (Separation of Concerns)

#### 안티패턴 예시

```javascript
// ❌ 비즈니스 로직과 UI 로직이 혼재
function calcCart() {
  // 계산 로직
  totalAmt += itemTot * (1 - disc);

  // DOM 직접 조작
  elem.style.fontWeight = q >= 10 ? 'bold' : 'normal';

  // 콘솔 로깅
  console.log('할인 적용: ' + curItem.name);
}
```

#### 클린코드 원칙

- **Model**: 데이터와 비즈니스 로직
- **View**: UI 렌더링
- **Controller**: 사용자 입력 처리와 조정

### 3.2 의존성 역전 원칙

#### 문제점

- 고수준 모듈이 저수준 모듈에 직접 의존
- DOM 요소에 직접 접근하여 테스트 어려움

#### 해결 방법

```javascript
// ✅ 인터페이스를 통한 의존성 주입
class CartService {
  constructor(storage, renderer, calculator) {
    this.storage = storage;
    this.renderer = renderer;
    this.calculator = calculator;
  }
}
```

## Part 4: 실전 리팩토링 전략

### 4.1 점진적 개선

1. **작동하는 테스트 작성**: 기존 동작 보장
2. **작은 단위로 리팩토링**: 한 번에 하나씩
3. **지속적인 검증**: 각 단계마다 테스트 실행

### 4.2 리팩토링 우선순위

1. **가독성 개선**
   - 변수명 개선
   - 함수 분리
   - 주석 대신 자명한 코드

2. **구조 개선**
   - 중복 제거
   - 모듈화
   - 의존성 정리

3. **성능 최적화**
   - 불필요한 계산 제거
   - 캐싱 적용
   - 알고리즘 개선

## Part 5: AI 시대의 코드 리뷰 체크리스트

### 5.1 즉시 거부해야 할 코드

- [ ] 전역 변수 남용
- [ ] 하드코딩된 값
- [ ] 300줄 이상의 함수
- [ ] 중복 코드 3회 이상
- [ ] 테스트 불가능한 구조

### 5.2 개선 요청할 코드

- [ ] 불명확한 변수명
- [ ] 주석 없는 복잡한 로직
- [ ] 일관성 없는 코딩 스타일
- [ ] 과도한 중첩 (3단계 이상)
- [ ] 에러 처리 부재

### 5.3 AI 생성 코드 평가 기준

1. **정확성**: 요구사항을 충족하는가?
2. **가독성**: 다른 개발자가 이해할 수 있는가?
3. **유지보수성**: 변경이 쉬운가?
4. **테스트 가능성**: 단위 테스트 작성이 가능한가?
5. **성능**: 불필요한 연산이 없는가?

## 실습 과제 가이드

### Phase 1: 문제 인식

- cart-tailwind.html의 안티패턴 10개 찾기
- 각 문제가 야기할 수 있는 실제 버그 시나리오 작성

### Phase 2: 설계

- 클린 아키텍처로 재설계
- 모듈 다이어그램 작성
- 인터페이스 정의

### Phase 3: 구현

- 테스트 먼저 작성 (TDD)
- 점진적 리팩토링
- 코드 리뷰와 개선

### Phase 4: 검증

- 성능 비교
- 가독성 평가
- 확장성 테스트

## 결론: 클린코드는 팀워크다

### AI와의 협업에서 클린코드의 역할

- AI는 빠르게 코드를 생성하지만, 품질 판단은 인간의 몫
- 클린코드 원칙을 알면 AI에게 더 나은 지시 가능
- 코드 리뷰 능력이 곧 AI 활용 능력

### 지속적인 학습

- 클린코드는 한 번에 완성되지 않음
- 팀의 합의와 지속적인 개선이 필요
- 실무 경험을 통한 감각 습득이 중요

## 참고 자료

- Clean Code by Robert C. Martin
- Refactoring by Martin Fowler
- The Pragmatic Programmer by David Thomas & Andrew Hunt
- Working Effectively with Legacy Code by Michael Feathers
