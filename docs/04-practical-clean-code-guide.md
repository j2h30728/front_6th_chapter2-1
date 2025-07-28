# 실전 클린코드 작성을 위한 구체적 행동 지침

## 핵심 멘탈 모델: "코드는 읽는 시간이 쓰는 시간보다 10배 이상 길다"

### 1. 변수와 함수의 인접성 원칙 (Proximity Principle)

#### ❌ 나쁜 예: 선언과 사용이 멀리 떨어진 코드

```javascript
// cart-tailwind.html의 실제 예
function calcCart() {
  // 52줄의 변수 선언부
  var cartItems;
  var subTot;
  var itemDiscounts;
  var calculationStartTime;
  var isCalculating;
  var lowStockItems;
  var idx;
  // ... 25개 이상의 변수 선언

  // 100줄 떨어진 곳에서 첫 사용
  cartItems = cartDisp.children;

  // 또 50줄 후에 subTot 사용
  subTot = 0;
}
```

#### ✅ 좋은 예: 선언과 사용을 가깝게

```javascript
function calcCart() {
  const cartItems = cartDisp.children;
  let subtotal = 0;

  // cartItems를 바로 사용
  for (const item of cartItems) {
    const quantity = parseInt(item.querySelector('.quantity-number').textContent);
    const price = getProductPrice(item.id);
    subtotal += quantity * price;
  }

  // 필요한 시점에 선언
  const discounts = calculateDiscounts(subtotal, cartItems);
  const total = subtotal - discounts;
}
```

### 행동 지침

1. **변수는 첫 사용 직전에 선언하라**
2. **함수 상단에 모든 변수를 선언하지 마라**
3. **관련된 코드는 물리적으로 가깝게 배치하라**

---

## 2. 코드 블록의 응집도 (Code Cohesion)

### 멘탈 모델: "관련 있는 것끼리 모으고, 관련 없는 것은 분리하라"

#### ❌ 나쁜 예: 섞여있는 관심사

```javascript
function processCart() {
  // 할인 계산
  var discount = 0;
  if (quantity > 10) discount = 0.1;

  // 갑자기 DOM 조작
  document.getElementById('loading').style.display = 'none';

  // 다시 할인 계산
  if (isTuesday()) discount += 0.1;

  // 또 DOM 조작
  document.getElementById('total').textContent = total;

  // 다시 비즈니스 로직
  var points = calculatePoints(total);
}
```

#### ✅ 좋은 예: 관련 코드끼리 그룹화

```javascript
function processCart() {
  // 1. 할인 계산 블록
  const discount = calculateTotalDiscount();

  // 2. 포인트 계산 블록
  const points = calculatePoints(total);

  // 3. UI 업데이트 블록
  updateUI({
    total,
    discount,
    points,
  });
}

function calculateTotalDiscount() {
  let discount = 0;
  if (quantity > 10) discount = 0.1;
  if (isTuesday()) discount += 0.1;
  return discount;
}
```

### 행동 지침

1. **같은 목적의 코드는 연속된 블록으로 작성**
2. **다른 관심사가 섞이면 즉시 함수로 분리**
3. **빈 줄로 논리적 블록을 구분**

---

## 3. 조건문의 명확성 (Clarity over Cleverness)

### 멘탈 모델: "영리한 코드보다 명확한 코드"

#### ❌ 나쁜 예: 복잡한 조건문

```javascript
// 무엇을 하는지 파악하기 어려움
if (
  product.q > 0 &&
  (!product.onSale || (product.onSale && product.suggestSale)) &&
  (itemCount < 30 || (itemCount >= 30 && totalAmt > 100000))
) {
  // 처리
}
```

#### ✅ 좋은 예: 의도가 명확한 조건문

```javascript
const isInStock = product.quantity > 0;
const hasSpecialDiscount = product.onSale && product.suggestSale;
const isEligibleForPurchase = itemCount < 30 || (itemCount >= 30 && totalAmt > 100000);

if (isInStock && (hasSpecialDiscount || isEligibleForPurchase)) {
  // 처리
}
```

### 행동 지침

1. **복잡한 조건은 변수로 추출하여 이름을 붙여라**
2. **부정 조건보다 긍정 조건을 사용하라**
3. **조기 반환(early return)으로 중첩을 줄여라**

---

## 4. 함수의 단일 추상화 수준 (Single Level of Abstraction)

### 멘탈 모델: "함수 안에서는 한 가지 추상화 수준만 다뤄라"

#### ❌ 나쁜 예: 여러 추상화 수준이 혼재

```javascript
function addToCart(productId) {
  // 고수준: 비즈니스 로직
  const product = findProduct(productId);

  // 저수준: DOM 조작 디테일
  const div = document.createElement('div');
  div.className = 'cart-item';
  div.innerHTML = `<span>${product.name}</span>`;

  // 중간 수준: 계산
  const price = product.price * (1 - discount);

  // 초저수준: 스타일 조작
  div.style.backgroundColor = '#f0f0f0';
  div.style.padding = '10px';
}
```

#### ✅ 좋은 예: 동일한 추상화 수준

```javascript
function addToCart(productId) {
  const product = findProduct(productId);
  const cartItem = createCartItem(product);
  const finalPrice = calculateFinalPrice(product);

  appendToCart(cartItem);
  updateTotalPrice(finalPrice);
}

// 세부 구현은 각자의 함수에서
function createCartItem(product) {
  const element = document.createElement('div');
  element.className = 'cart-item';
  element.innerHTML = renderCartItemTemplate(product);
  applyCartItemStyles(element);
  return element;
}
```

### 행동 지침

1. **함수를 읽을 때 줌 레벨이 바뀌면 안 됨**
2. **고수준 함수는 '무엇'을, 저수준 함수는 '어떻게'를**
3. **TO 문단으로 함수를 설명할 수 있어야 함**
   - TO 장바구니에 추가하려면
   - TO 상품을 찾고
   - TO 카트 아이템을 생성하고
   - TO 최종 가격을 계산한다

---

## 5. 데이터 흐름의 명확성 (Clear Data Flow)

### 멘탈 모델: "데이터는 한 방향으로 흐른다"

#### ❌ 나쁜 예: 예측 불가능한 데이터 흐름

```javascript
let total = 0;

function calculatePrice() {
  total = 100; // 전역 변수 수정
  applyDiscount();
  return total;
}

function applyDiscount() {
  if (isVIP) {
    total *= 0.8; // 또 전역 변수 수정
  }
  addTax();
}

function addTax() {
  total *= 1.1; // 또또 전역 변수 수정
}
```

#### ✅ 좋은 예: 명확한 데이터 흐름

```javascript
function calculatePrice(basePrice) {
  const discountedPrice = applyDiscount(basePrice);
  const finalPrice = addTax(discountedPrice);
  return finalPrice;
}

function applyDiscount(price) {
  return isVIP ? price * 0.8 : price;
}

function addTax(price) {
  return price * 1.1;
}
```

### 행동 지침

1. **함수는 입력을 받아 출력을 반환**
2. **side effect는 함수명에 명시**
3. **전역 변수 수정 대신 새 값을 반환**

---

## 6. 일관성 있는 코드 스타일 (Consistency is Key)

### 멘탈 모델: "한 가지 방법을 정하면 끝까지 지켜라"

#### ❌ 나쁜 예: 일관성 없는 스타일

```javascript
// 배열 순회 방법이 제각각
prodList.forEach((p) => (totalStock += p.q));

for (var i = 0; i < prodList.length; i++) {
  if (prodList[i].q < 5) {
  }
}

var idx = 0;
while (idx < nodes.length) {
  // ...
  idx++;
}
```

#### ✅ 좋은 예: 일관된 스타일

```javascript
// 한 가지 방법으로 통일
products.forEach((product) => {
  totalStock += product.quantity;
});

products.forEach((product) => {
  if (product.quantity < 5) {
    lowStockItems.push(product);
  }
});
```

### 행동 지침

1. **팀 컨벤션을 정하고 자동화 도구 사용**
2. **기존 코드의 스타일을 따르기**
3. **한 파일 안에서는 반드시 일관성 유지**

---

## 7. 에러 처리의 명시성 (Explicit Error Handling)

### 멘탈 모델: "실패할 수 있는 모든 곳에서 실패를 처리하라"

#### ❌ 나쁜 예: 숨겨진 에러

```javascript
function getProduct(id) {
  const product = products.find((p) => p.id === id);
  return product.name; // product가 undefined면?
}
```

#### ✅ 좋은 예: 명시적 에러 처리

```javascript
function getProduct(id) {
  const product = products.find((p) => p.id === id);

  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }

  return product;
}

// 또는 Optional 패턴
function getProductSafe(id) {
  const product = products.find((p) => p.id === id);
  return product || null;
}
```

### 행동 지침

1. **null/undefined 체크를 명시적으로**
2. **에러는 빨리 발생시키고 명확하게 전달**
3. **복구 가능한 에러와 불가능한 에러 구분**

---

## 8. 주석 대신 코드로 설명 (Self-Documenting Code)

### 멘탈 모델: "주석이 필요하다면 코드를 개선할 여지가 있다"

#### ❌ 나쁜 예: 주석으로 설명

```javascript
// 화요일이면 10% 추가 할인
if (new Date().getDay() === 2) {
  total *= 0.9;
}

// 상품이 10개 이상이면 할인 적용
if (q >= 10) {
  if (curItem.id === PRODUCT_ONE) disc = 0.1;
}
```

#### ✅ 좋은 예: 코드 자체가 설명

```javascript
const TUESDAY = 2;
const TUESDAY_DISCOUNT_RATE = 0.1;

if (isTuesday()) {
  total = applyTuesdayDiscount(total);
}

const BULK_DISCOUNT_THRESHOLD = 10;
if (quantity >= BULK_DISCOUNT_THRESHOLD) {
  discount = getProductBulkDiscount(product.id);
}
```

### 행동 지침

1. **함수와 변수 이름으로 의도 표현**
2. **매직 넘버는 상수로 추출**
3. **복잡한 조건은 함수로 추출**

---

## 9. 테스트 가능한 코드 구조

### 멘탈 모델: "테스트하기 어렵다면 설계가 잘못된 것"

#### ❌ 나쁜 예: 테스트 불가능한 코드

```javascript
function processOrder() {
  const today = new Date();
  const total = document.getElementById('total').textContent;

  if (today.getDay() === 2) {
    fetch('/api/discount')
      .then((res) => res.json())
      .then((discount) => {
        document.getElementById('final').textContent = total * discount;
      });
  }
}
```

#### ✅ 좋은 예: 테스트 가능한 코드

```javascript
function calculateOrderTotal(total, date, discountService) {
  if (isTuesday(date)) {
    const discount = discountService.getTuesdayDiscount();
    return total * (1 - discount);
  }
  return total;
}

// 의존성 주입으로 테스트 가능
const total = calculateOrderTotal(100, new Date(), discountService);
```

### 행동 지침

1. **순수 함수로 비즈니스 로직 분리**
2. **외부 의존성은 주입받기**
3. **시간, 랜덤같은 비결정적 요소 격리**

---

## 10. 점진적 개선 (Incremental Improvement)

### 멘탈 모델: "완벽한 코드는 없다. 조금씩 개선하라"

### 리팩토링 우선순위

1. **가독성** → 2. **중복 제거** → 3. **구조 개선** → 4. **성능 최적화**

### 실전 체크리스트

- [ ] 이 함수는 한 가지 일만 하는가?
- [ ] 변수명이 그 역할을 설명하는가?
- [ ] 조건문을 읽고 즉시 이해되는가?
- [ ] 비슷한 코드가 3번 이상 반복되는가?
- [ ] 함수가 20줄을 넘어가는가?
- [ ] 들여쓰기가 3단계를 넘어가는가?
- [ ] 전역 변수를 수정하는가?
- [ ] 테스트를 작성할 수 있는가?

### 행동 지침

1. **보이스카우트 규칙: 처음 왔을 때보다 깨끗하게**
2. **작은 개선을 자주, 큰 개선은 신중하게**
3. **팀과 함께 개선 (코드 리뷰 활용)**

---

## 실전 연습 방법

### 1단계: 인식 (Recognition)

- 더티코드 패턴을 보면 즉시 알아차리기
- "이상한 냄새"를 감지하는 능력 기르기

### 2단계: 분석 (Analysis)

- 왜 이 코드가 문제인지 설명할 수 있기
- 어떤 상황에서 버그가 발생할지 예측하기

### 3단계: 개선 (Improvement)

- 구체적인 개선 방법 제시하기
- 트레이드오프 고려하기

### 4단계: 예방 (Prevention)

- 처음부터 클린하게 작성하기
- 코드 리뷰에서 조기 발견하기

## 마무리: 클린코드는 습관이다

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

코드는 한 번 쓰고 여러 번 읽힌다. 미래의 자신과 동료를 위해 읽기 쉬운 코드를 작성하자.
