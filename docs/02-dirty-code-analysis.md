# cart-tailwind.html 더티코드 상세 분석

## 개요

이 문서는 cart-tailwind.html 파일의 더티코드 패턴을 카테고리별로 분석하여, 학생들이 실제 코드에서 문제점을 찾고 개선하는 능력을 기르는 데 도움을 주기 위해 작성되었습니다.

## 1. 변수 선언과 네이밍의 문제점

### 1.1 일관성 없는 변수 선언

```javascript
// 33-34번 줄: var 사용
var prodList, sel, addBtn, cartDisp, sum, stockInfo;
var lastSel,
  bonusPts = 0,
  totalAmt = 0,
  itemCnt = 0;

// 47-48번 줄: const, let 혼용
const PRODUCT_ONE = 'p1',
  PRODUCT_TWO = 'p2',
  p3_id = 'p3';
let p4 = 'p4',
  productFive = `p5`;
```

**문제점:**

- var, let, const가 일관성 없이 사용됨
- 전역 스코프 오염
- 호이스팅으로 인한 예측 불가능한 동작

### 1.2 의미 없는 변수명

```javascript
// 의미를 알 수 없는 축약어
var p, q, amt, sel, tgt;
var curItem, qtyElem, itemTot, disc;
```

**개선 방향:**

- `p` → `product`
- `q` → `quantity`
- `amt` → `amount`
- `sel` → `selector` 또는 `productSelect`

### 1.3 네이밍 컨벤션 불일치

```javascript
// 다양한 네이밍 스타일 혼재
const PRODUCT_ONE = 'p1'; // UPPER_SNAKE_CASE
let productFive = 'p5'; // camelCase
var p3_id = 'p3'; // snake_case
var totalAmt = 0; // 축약어 사용
```

## 2. 함수 설계의 문제점

### 2.1 과도하게 긴 함수

```javascript
// calcCart 함수: 351-560번 줄 (209줄!)
function calcCart() {
  // 1. 초기화
  // 2. 재고 체크
  // 3. 가격 계산
  // 4. 할인 적용
  // 5. 포인트 계산
  // 6. UI 업데이트
  // 7. 통계 수집
  // ... 너무 많은 책임
}
```

**문제점:**

- 단일 책임 원칙 위반
- 테스트하기 어려움
- 재사용 불가능
- 디버깅 어려움

### 2.2 함수 정의 위치의 혼란

```javascript
// 36번 줄: main 함수 전에 갑자기 등장
function getDiscountRate(productId, quantity) {}

// 50번 줄: main 함수 정의
function main() {}

// 644번 줄: 중간에 갑자기 등장
function getTotalStock() {}
```

## 3. 중복 코드 패턴

### 3.1 포인트 계산 중복

```javascript
// calcCart 함수 내부 (541-542번 줄)
var pts = Math.floor(totalAmt / 1000);
if (new Date().getDay() === 2) pts *= 2;

// renderBonusPts 함수 내부 (570-584번 줄)
var basePoints = Math.floor(totalAmt / 1000);
if (new Date().getDay() === 2) finalPoints *= 2;

// 여러 곳에서 반복되는 화요일 체크
if (new Date().getDay() === 2) {
}
```

### 3.2 재고 체크 중복

```javascript
// updateSelOpts (310번 줄)
prodList.forEach((p) => (totalStock += p.q));

// calcCart (364-368번 줄)
for (var idx = 0; idx < prodList.length; idx++) {
  if (prodList[idx].q < 5 && prodList[idx].q > 0) {
    lowStockItems.push(prodList[idx].name);
  }
}

// getTotalStock (644-648번 줄)
function getTotalStock() {
  var sum = 0;
  prodList.forEach((p) => (sum += p.q));
  return sum;
}
```

### 3.3 DOM 조작 중복

```javascript
// 여러 곳에서 반복되는 패턴
document.getElementById('loyalty-points').textContent = '...';
document.getElementById('loyalty-points').style.display = 'block';
document.getElementById('loyalty-points').innerHTML = '...';
```

## 4. 매직 넘버와 하드코딩

### 4.1 설명 없는 숫자들

```javascript
if (quantity < 10) return 0; // 10의 의미?
if (itemCnt >= 30) {
} // 30의 의미?
totalAmt *= 1 - 0.1; // 0.1의 의미?
if (product.q < 5) {
} // 5의 의미?
setInterval(function () {}, 30000); // 30000의 의미?
```

### 4.2 하드코딩된 할인율

```javascript
if (productId === 'p1') return 0.1; // 10%
if (productId === 'p2') return 0.15; // 15%
if (productId === 'p3') return 0.2; // 20%
luckyItem.val = Math.round(luckyItem.originalVal * 0.8); // 20% 할인
```

## 5. 전역 상태 관리의 문제

### 5.1 전역 변수 직접 조작

```javascript
// main 함수 내부에서 전역 변수 초기화 (52-54번 줄)
totalAmt = 0;
itemCnt = 0;
lastSel = null;

// 여러 함수에서 전역 변수 직접 수정
prodList[idx].q--;
bonusPts = finalPoints;
```

### 5.2 상태의 일관성 부재

```javascript
// 같은 정보를 여러 곳에서 중복 관리
// DOM의 수량과 prodList의 재고가 따로 관리됨
qtyElem.textContent = newQty;
itemToAdd['q']--;
```

## 6. 비즈니스 로직과 UI의 혼재

### 6.1 calcCart 함수의 다중 책임

```javascript
function calcCart() {
  // 비즈니스 로직
  totalAmt += itemTot * (1 - disc);

  // DOM 조작
  elem.style.fontWeight = q >= 10 ? 'bold' : 'normal';

  // 로깅
  console.log('할인 적용: ' + curItem.name);

  // UI 업데이트
  document.getElementById('item-count').textContent = '...';
}
```

## 7. 에러 처리 부재

### 7.1 null 체크 누락

```javascript
// DOM 요소가 없을 수 있음
var totalDiv = sum.querySelector('.text-2xl');
if (totalDiv) {
  totalDiv.textContent = '₩' + Math.round(totalAmt).toLocaleString();
}
// 하지만 다른 곳에서는 체크하지 않음
```

### 7.2 예외 상황 미처리

```javascript
// 배열이 비어있을 때 처리 없음
var luckyIdx = Math.floor(Math.random() * prodList.length);
var luckyItem = prodList[luckyIdx]; // prodList가 비어있으면?
```

## 8. 성능 문제

### 8.1 불필요한 반복 계산

```javascript
// 매번 새로운 Date 객체 생성
if (new Date().getDay() === 2) {
}
if (new Date().getDay() === 2) {
}
```

### 8.2 비효율적인 DOM 조작

```javascript
// innerHTML 반복 사용
summaryDetails.innerHTML += `...`;
summaryDetails.innerHTML += `...`;
summaryDetails.innerHTML += `...`;
```

## 9. 일관성 없는 코딩 스타일

### 9.1 공백과 들여쓰기

```javascript
// 일관성 없는 공백
var opt = document.createElement('option');
let leftColumn = document.createElement('div');
```

### 9.2 괄호 사용

```javascript
// 때로는 괄호 사용
leftColumn['className'] = '...'
// 때로는 점 표기법
leftColumn.appendChild(...)
```

### 9.3 문자열 표현

```javascript
// 따옴표 혼용
const PRODUCT_ONE = 'p1';
let p4 = 'p4';
productFive = `p5`;
```

## 10. 주석과 문서화

### 10.1 의미 없는 주석

```javascript
// Header
let header = document.createElement('div');

// 여기서도 카트 체크 (중복)
if (cartDisp.children.length === 0) {
}
```

### 10.2 복잡한 로직에 대한 설명 부재

```javascript
// 이 계산이 왜 필요한지 설명 없음
discRate = discRate + 0.1 * (1 - discRate);
```

## 학습 포인트

1. **코드 스멜(Code Smell) 감지 능력**
   - 긴 함수, 긴 매개변수 목록
   - 중복 코드
   - 거대한 클래스
   - 의미 없는 이름

2. **리팩토링 기회 인식**
   - 함수 추출
   - 변수 추출
   - 조건문 단순화
   - 반복문 파이프라인으로 변경

3. **설계 원칙 적용**
   - 단일 책임 원칙 (SRP)
   - 개방-폐쇄 원칙 (OCP)
   - 의존성 역전 원칙 (DIP)
   - DRY (Don't Repeat Yourself)

4. **실무적 관점**
   - 이런 코드를 인수인계 받았을 때 대처법
   - 점진적 개선 전략
   - 테스트 작성을 통한 안전한 리팩토링

## 과제 제안

1. **Level 1: 문제 찾기**
   - 10가지 이상의 코드 스멜 찾기
   - 각 문제가 야기할 수 있는 버그 시나리오 작성

2. **Level 2: 우선순위 정하기**
   - 발견한 문제들의 심각도 평가
   - 리팩토링 순서 결정

3. **Level 3: 개선하기**
   - 가장 심각한 문제부터 해결
   - 각 단계마다 테스트로 검증

4. **Level 4: 재설계하기**
   - 클린 아키텍처로 전체 재설계
   - 모던 JavaScript 패턴 적용
