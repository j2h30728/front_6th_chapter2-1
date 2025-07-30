import createStore from './utils/createStore.js';

// 🏪 Cart Store - 장바구니 상태 관리
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEM_COUNT':
      return { ...state, itemCnt: action.payload };
    case 'RESET_ITEM_COUNT':
      return { ...state, itemCnt: 0 };
    case 'ADD_TO_ITEM_COUNT':
      return { ...state, itemCnt: state.itemCnt + action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmt: action.payload };
    case 'ADD_TO_TOTAL_AMOUNT':
      return { ...state, totalAmt: state.totalAmt + action.payload };
    case 'SET_LAST_SELECTED':
      return { ...state, lastSel: action.payload };
    case 'RESET_CART':
      return { ...state, itemCnt: 0, totalAmt: 0, lastSel: null };
    default:
      return state;
  }
};

const cartStore = createStore(cartReducer, {
  itemCnt: 0,
  totalAmt: 0,
  lastSel: null,
});

const PRODUCT_ONE = 'p1';
const p2 = 'p2';
const product_3 = 'p3';
const p4 = 'p4';
const PRODUCT_5 = `p5`;

const prodList = [
  {
    id: PRODUCT_ONE,
    name: '버그 없애는 키보드',
    val: 10000,
    originalVal: 10000,
    q: 50,
    onSale: false,
    suggestSale: false,
  },
  { id: p2, name: '생산성 폭발 마우스', val: 20000, originalVal: 20000, q: 30, onSale: false, suggestSale: false },
  {
    id: product_3,
    name: '거북목 탈출 모니터암',
    val: 30000,
    originalVal: 30000,
    q: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: p4,
    name: '에러 방지 노트북 파우치',
    val: 15000,
    originalVal: 15000,
    q: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_5,
    name: `코딩할 때 듣는 Lo-Fi 스피커`,
    val: 25000,
    originalVal: 25000,
    q: 10,
    onSale: false,
    suggestSale: false,
  },
];

// 🧩 컴포넌트들 - React스러운 구조
const createHeader = () => /*html*/ `
  <div class="mb-8">
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  </div>
`;

const createProductSelector = () => /*html*/ `
  <div class="mb-6 pb-6 border-b border-gray-200">
    <select id="product-select" class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"></select>
    <button id="add-to-cart" class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all">
      Add to Cart
    </button>
    <div id="stock-status" class="text-xs text-red-500 mt-3 whitespace-pre-line"></div>
  </div>
`;

const createCartItems = () => /*html*/ `
  <div id="cart-items"></div>
`;

const createMainContent = () => /*html*/ `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    ${createProductSelector()}
    ${createCartItems()}
  </div>
`;

const createRightColumn = () => /*html*/ `
  <div class="bg-black text-white p-8 flex flex-col">
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  </div>
`;

const createBulkDiscountHTML = () => /*html*/ `
  <div class="flex justify-between text-sm tracking-wide text-green-400">
    <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
    <span class="text-xs">-25%</span>
  </div>
`;

const createManualToggleButton = () => /*html*/ `
  <button id="manual-toggle" class="fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  </button>
`;

const createManualOverlay = () => /*html*/ `
  <div id="manual-overlay" class="fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300">
    <div id="manual-column" class="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300">
      <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('#manual-overlay').classList.add('hidden'); document.querySelector('#manual-column').classList.add('translate-x-full')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
      <div class="mb-6">
        <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
        <div class="space-y-3">
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="font-semibold text-sm mb-1">개별 상품</p>
            <p class="text-gray-700 text-xs pl-2">
              • 키보드 10개↑: 10%<br>
              • 마우스 10개↑: 15%<br>
              • 모니터암 10개↑: 20%<br>
              • 스피커 10개↑: 25%
            </p>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="font-semibold text-sm mb-1">전체 수량</p>
            <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="font-semibold text-sm mb-1">특별 할인</p>
            <p class="text-gray-700 text-xs pl-2">
              • 화요일: +10%<br>
              • ⚡번개세일: 20%<br>
              • 💝추천할인: 5%
            </p>
          </div>
        </div>
      </div>
      <div class="mb-6">
        <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
        <div class="space-y-3">
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="font-semibold text-sm mb-1">기본</p>
            <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
          </div>
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="font-semibold text-sm mb-1">추가</p>
            <p class="text-gray-700 text-xs pl-2">
              • 화요일: 2배<br>
              • 키보드+마우스: +50p<br>
              • 풀세트: +100p<br>
              • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
            </p>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 pt-4 mt-4">
        <p class="text-xs font-bold mb-1">💡 TIP</p>
        <p class="text-2xs text-gray-600 leading-relaxed">
          • 화요일 대량구매 = MAX 혜택<br>
          • ⚡+💝 중복 가능<br>
          • 상품4 = 품절
        </p>
      </div>
    </div>
  </div>
`;

// 🏗️ 앱 전체 구조 조합
const createApp = () => /*html*/ `
  ${createHeader()}
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
    ${createMainContent()}
    ${createRightColumn()}
  </div>
  ${createManualToggleButton()}
  ${createManualOverlay()}
`;

function main() {
  cartStore.dispatch({ type: 'RESET_CART' });

  const root = document.getElementById('app');

  // 컴포넌트 조합으로 앱 렌더링
  root.innerHTML = createApp();

  // DOM 요소들 참조
  const manualToggle = document.getElementById('manual-toggle');
  const manualOverlay = document.getElementById('manual-overlay');
  const manualColumn = document.getElementById('manual-column');

  // 이벤트 리스너 추가
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };

  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  const lightningDelay = Math.random() * 10000;

  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * prodList.length);
      const luckyItem = prodList[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);

  setTimeout(function () {
    setInterval(function () {
      if (cartStore.getState().lastSel) {
        let suggest = null;
        for (let k = 0; k < prodList.length; k++) {
          if (prodList[k].id !== cartStore.getState().lastSel) {
            if (prodList[k].q > 0) {
              if (!prodList[k].suggestSale) {
                suggest = prodList[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

function onUpdateSelectOptions() {
  const sel = document.getElementById('product-select');

  // 전체 재고 계산
  const totalStock = prodList.reduce((total, product) => total + product.q, 0);

  // 상품을 option HTML로 변환하는 함수
  const createOptionHTML = (item) => {
    const getSaleIcon = () => {
      if (item.onSale && item.suggestSale) return '⚡💝';
      if (item.onSale) return '⚡';
      if (item.suggestSale) return '💝';
      return '';
    };

    const getOptionClass = () => {
      if (item.q === 0) return 'text-gray-400';
      if (item.onSale && item.suggestSale) return 'text-purple-600 font-bold';
      if (item.onSale) return 'text-red-500 font-bold';
      if (item.suggestSale) return 'text-blue-500 font-bold';
      return '';
    };

    const getOptionText = () => {
      const icon = getSaleIcon();

      if (item.q === 0) {
        return `${item.name} - ${item.val}원 (품절)`;
      }

      if (item.onSale && item.suggestSale) {
        return `${icon}${item.name} - ${item.originalVal}원 → ${item.val}원 (25% SUPER SALE!)`;
      }

      if (item.onSale) {
        return `${icon}${item.name} - ${item.originalVal}원 → ${item.val}원 (20% SALE!)`;
      }

      if (item.suggestSale) {
        return `${icon}${item.name} - ${item.originalVal}원 → ${item.val}원 (5% 추천할인!)`;
      }

      return `${item.name} - ${item.val}원`;
    };

    return `
      <option 
        value="${item.id}" 
        class="${getOptionClass()}"
        ${item.q === 0 ? 'disabled' : ''}
      >
        ${getOptionText()}
      </option>
    `;
  };

  // 템플릿 리터럴로 옵션들 생성
  sel.innerHTML = prodList.map(createOptionHTML).join('');

  // 재고 상태에 따른 스타일 적용
  sel.style.borderColor = totalStock < 50 ? 'orange' : '';
}

// 📊 순수 계산 함수들
const calculateItemDiscounts = (cartItems) => {
  const itemDiscounts = [];

  for (let i = 0; i < cartItems.length; i++) {
    const curItem = prodList.find((product) => product.id === cartItems[i].id);
    const qtyElem = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);

    // 10개 이상 구매 시 할인 적용
    if (quantity >= 10) {
      const discountRates = {
        [PRODUCT_ONE]: 0.1,
        [p2]: 0.15,
        [product_3]: 0.2,
        [p4]: 0.05,
        [PRODUCT_5]: 0.25,
      };

      const discount = discountRates[curItem.id] || 0;

      if (discount > 0) {
        itemDiscounts.push({ name: curItem.name, discount: discount * 100 });
      }
    }
  }

  return itemDiscounts;
};

// 📦 재고 상태 헬퍼 함수
const createStockMessage = (item) => {
  if (item.q === 0) {
    return `${item.name}: 품절`;
  } else if (item.q < 5) {
    return `${item.name}: 재고 부족 (${item.q}개 남음)`;
  }
  return null; // 재고 충분한 경우
};

// 📊 주문 요약 HTML 헬퍼 함수
const createSummaryItemHTML = (item, quantity) => /*html*/ `
  <div class="flex justify-between text-xs tracking-wide text-gray-400">
    <span>${item.name} x ${quantity}</span>
    <span>₩${(item.val * quantity).toLocaleString()}</span>
  </div>
`;

const createSummarySubtotalHTML = (subtotal) => /*html*/ `
  <div class="border-t border-white/10 my-3"></div>
  <div class="flex justify-between text-sm tracking-wide">
    <span>Subtotal</span>
    <span>₩${subtotal.toLocaleString()}</span>
  </div>
`;

const createItemDiscountHTML = (discountInfo) => /*html*/ `
  <div class="flex justify-between text-sm tracking-wide text-green-400">
    <span class="text-xs">${discountInfo.name} (10개↑)</span>
    <span class="text-xs">-${discountInfo.discount}%</span>
  </div>
`;

const createTuesdayDiscountHTML = () => /*html*/ `
  <div class="flex justify-between text-sm tracking-wide text-purple-400">
    <span class="text-xs">🌟 화요일 추가 할인</span>
    <span class="text-xs">-10%</span>
  </div>
`;

const createShippingHTML = () => /*html*/ `
  <div class="flex justify-between text-sm tracking-wide text-gray-400">
    <span>Shipping</span>
    <span>Free</span>
  </div>
`;

function handleCalculateCartStuff() {
  cartStore.dispatch({ type: 'SET_TOTAL_AMOUNT', payload: 0 });
  cartStore.dispatch({ type: 'RESET_ITEM_COUNT' });

  const cartDisp = document.getElementById('cart-items');
  const cartItems = cartDisp.children;

  let subTot = 0;
  const lowStockItems = [];

  // 할인 정보 계산
  const itemDiscounts = calculateItemDiscounts(cartItems);

  for (let idx = 0; idx < prodList.length; idx++) {
    if (prodList[idx].q < 5 && prodList[idx].q > 0) {
      lowStockItems.push(prodList[idx].name);
    }
  }

  for (let i = 0; i < cartItems.length; i++) {
    const curItem = prodList.find((product) => product.id === cartItems[i].id);
    const qtyElem = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    const itemTotal = curItem.val * quantity;
    let discount = 0;

    cartStore.dispatch({ type: 'ADD_TO_ITEM_COUNT', payload: quantity });
    subTot += itemTotal;

    // 수량에 따른 굵은 글씨 적용
    const itemDiv = cartItems[i];
    const priceElems = itemDiv.querySelectorAll('.text-lg, .text-xs');
    priceElems.forEach(function (elem) {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
      }
    });

    // 할인율 적용 (이미 계산된 할인 정보에서 찾기)
    if (quantity >= 10) {
      const discountRates = {
        [PRODUCT_ONE]: 0.1,
        [p2]: 0.15,
        [product_3]: 0.2,
        [p4]: 0.05,
        [PRODUCT_5]: 0.25,
      };

      discount = discountRates[curItem.id] || 0;
    }

    cartStore.dispatch({ type: 'ADD_TO_TOTAL_AMOUNT', payload: itemTotal * (1 - discount) });
  }

  let discRate = 0;
  const originalTotal = subTot;

  if (cartStore.getState().itemCnt >= 30) {
    cartStore.dispatch({ type: 'SET_TOTAL_AMOUNT', payload: (subTot * 75) / 100 });
    discRate = 25 / 100;
  } else {
    discRate = (subTot - cartStore.getState().totalAmt) / subTot;
  }

  // 화요일 추가 할인 적용
  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday && cartStore.getState().totalAmt > 0) {
    cartStore.dispatch({ type: 'SET_TOTAL_AMOUNT', payload: (cartStore.getState().totalAmt * 90) / 100 });
    discRate = 1 - cartStore.getState().totalAmt / originalTotal;
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
  }

  document.getElementById('item-count').textContent = '🛍️ ' + cartStore.getState().itemCnt + ' items in cart';

  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (subTot > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      const curItem = prodList.find((product) => product.id === cartItems[i].id);
      const qtyElem = cartItems[i].querySelector('.quantity-number');
      const quantity = parseInt(qtyElem.textContent);

      summaryDetails.innerHTML += createSummaryItemHTML(curItem, quantity);
    }
    summaryDetails.innerHTML += createSummarySubtotalHTML(subTot);
    if (cartStore.getState().itemCnt >= 30) {
      summaryDetails.innerHTML += createBulkDiscountHTML();
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += createItemDiscountHTML(item);
      });
    }
    if (isTuesday) {
      if (cartStore.getState().totalAmt > 0) {
        summaryDetails.innerHTML += createTuesdayDiscountHTML();
      }
    }
    summaryDetails.innerHTML += createShippingHTML();
  }

  const totalDiv = document.getElementById('cart-total').querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(cartStore.getState().totalAmt).toLocaleString();
  }

  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    const points = Math.floor(cartStore.getState().totalAmt / 1000);
    if (points > 0) {
      loyaltyPointsDiv.textContent = '적립 포인트: ' + points + 'p';
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.textContent = '적립 포인트: 0p';
      loyaltyPointsDiv.style.display = 'block';
    }
  }

  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (discRate > 0 && cartStore.getState().totalAmt > 0) {
    const savedAmount = originalTotal - cartStore.getState().totalAmt;
    discountInfoDiv.innerHTML = /*html*/ `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }

  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = '🛍️ ' + cartStore.getState().itemCnt + ' items in cart';
    if (previousCount !== cartStore.getState().itemCnt) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  let stockMsg = '';
  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.q < 5) {
      if (item.q > 0) {
        stockMsg = stockMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        stockMsg = stockMsg + item.name + ': 품절\n';
      }
    }
  }
  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = stockMsg;
  handleStockInfoUpdate();
  doRenderBonusPoints();
}

const doRenderBonusPoints = function () {
  const ptsTag = document.getElementById('loyalty-points');
  if (!ptsTag) return;

  const cartDisp = document.getElementById('cart-items');
  if (cartDisp.children.length === 0) {
    ptsTag.style.display = 'none';
    return;
  }

  const { finalPoints, pointsDetail } = calculateBonusPoints();

  if (finalPoints > 0) {
    ptsTag.innerHTML = createBonusPointsHTML(finalPoints, pointsDetail);
    ptsTag.style.display = 'block';
  } else {
    ptsTag.textContent = '적립 포인트: 0p';
    ptsTag.style.display = 'block';
  }
};

const handleStockInfoUpdate = function () {
  // 재고 부족/품절 상품들을 필터링하고 메시지 생성
  const stockMessages = prodList
    .filter((item) => item.q < 5)
    .map(createStockMessage)
    .filter((message) => message !== null);

  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = stockMessages.join('\n');
};

// 🎁 포인트 계산 헬퍼 함수
const calculateBonusPoints = () => {
  const cartDisp = document.getElementById('cart-items');
  const cartItems = Array.from(cartDisp.children);

  if (cartItems.length === 0) {
    return { finalPoints: 0, pointsDetail: [] };
  }

  const basePoints = Math.floor(cartStore.getState().totalAmt / 1000);
  let finalPoints = 0;
  const pointsDetail = [];

  // 기본 포인트
  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push('기본: ' + basePoints + 'p');
  }

  // 화요일 2배 포인트
  const isTuesday = new Date().getDay() === 2;
  if (isTuesday && basePoints > 0) {
    finalPoints = basePoints * 2;
    pointsDetail.push('화요일 2배');
  }

  // 세트 구매 보너스 계산
  const productTypes = {
    hasKeyboard: false,
    hasMouse: false,
    hasMonitorArm: false,
  };

  cartItems.forEach((cartItem) => {
    const product = prodList.find((item) => item.id === cartItem.id);
    if (!product) return;

    if (product.id === PRODUCT_ONE) productTypes.hasKeyboard = true;
    else if (product.id === p2) productTypes.hasMouse = true;
    else if (product.id === product_3) productTypes.hasMonitorArm = true;
  });

  // 키보드 + 마우스 세트 보너스
  if (productTypes.hasKeyboard && productTypes.hasMouse) {
    finalPoints += 50;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }

  // 풀세트 보너스
  if (productTypes.hasKeyboard && productTypes.hasMouse && productTypes.hasMonitorArm) {
    finalPoints += 100;
    pointsDetail.push('풀세트 구매 +100p');
  }

  // 수량별 보너스
  if (cartStore.getState().itemCnt >= 30) {
    finalPoints += 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (cartStore.getState().itemCnt >= 20) {
    finalPoints += 50;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (cartStore.getState().itemCnt >= 10) {
    finalPoints += 20;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  return { finalPoints, pointsDetail };
};

// 💰 가격 업데이트 헬퍼 함수
const updateCartItemPrice = (cartItem, product) => {
  const priceDiv = cartItem.querySelector('.text-lg');
  const nameDiv = cartItem.querySelector('h3');

  // 가격 HTML 생성
  const priceHTML = getPriceHTML(product);

  // 이름에 아이콘 추가
  const icon = getSaleIcon(product);
  const nameText = `${icon}${product.name}`;

  // DOM 업데이트
  priceDiv.innerHTML = priceHTML;
  nameDiv.textContent = nameText;
};

// �� 포인트 관련 HTML 헬퍼 함수
const createBonusPointsHTML = (points, details) => /*html*/ `
  <div>적립 포인트: <span class="font-bold">${points}p</span></div>
  <div class="text-2xs opacity-70 mt-1">${details.join(', ')}</div>
`;

function doUpdatePricesInCart() {
  const cartDisp = document.getElementById('cart-items');
  const cartItems = Array.from(cartDisp.children);

  // 각 장바구니 아이템의 가격 정보 업데이트
  cartItems.forEach((cartItem) => {
    const itemId = cartItem.id;
    const product = prodList.find((item) => item.id === itemId);

    if (product) {
      updateCartItemPrice(cartItem, product);
    }
  });

  // 전체 계산 다시 실행
  handleCalculateCartStuff();
}

// 상품 아이콘 및 가격 표시 헬퍼 함수들
const getSaleIcon = (item) => {
  if (item.onSale && item.suggestSale) return '⚡💝';
  if (item.onSale) return '⚡';
  if (item.suggestSale) return '💝';
  return '';
};

const getPriceHTML = (item) => {
  if (!item.onSale && !item.suggestSale) {
    return `₩${item.val.toLocaleString()}`;
  }

  const colorClass =
    item.onSale && item.suggestSale ? 'text-purple-600' : item.onSale ? 'text-red-500' : 'text-blue-500';

  return /*html*/ `
    <span class="line-through text-gray-400">₩${item.originalVal.toLocaleString()}</span> 
    <span class="${colorClass}">₩${item.val.toLocaleString()}</span>
  `;
};

// 장바구니 아이템 HTML 생성 함수
const createCartItemHTML = (item) => {
  const icon = getSaleIcon(item);
  const priceHTML = getPriceHTML(item);

  return /*html*/ `
    <div 
      id="${item.id}" 
      class="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>
      
      <div>
        <h3 class="text-base font-normal mb-1 tracking-tight">${icon}${item.name}</h3>
        <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p class="text-xs text-black mb-3">${priceHTML}</p>
        
        <div class="flex items-center gap-4">
          <button 
            class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" 
            data-product-id="${item.id}" 
            data-change="-1"
          >−</button>
          <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
          <button 
            class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" 
            data-product-id="${item.id}" 
            data-change="1"
          >+</button>
        </div>
      </div>
      
      <div class="text-right">
        <div class="text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
        <a 
          class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" 
          data-product-id="${item.id}"
        >Remove</a>
      </div>
    </div>
  `;
};

//main 실행
main();

// 이벤트핸들러
const addBtn = document.getElementById('add-to-cart');
addBtn.addEventListener('click', function () {
  const sel = document.getElementById('product-select');
  const selItem = sel.value;
  const hasItem = prodList.some((product) => product.id === selItem);
  if (!selItem || !hasItem) {
    return;
  }
  const itemToAdd = prodList.find((product) => product.id === selItem);
  if (itemToAdd && itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd['id']);
    if (item) {
      const qtyElem = item.querySelector('.quantity-number');
      const newQty = parseInt(qtyElem['textContent']) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd['q']--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      // 템플릿 리터럴로 새 아이템 추가
      const cartDisp = document.getElementById('cart-items');
      cartDisp.insertAdjacentHTML('beforeend', createCartItemHTML(itemToAdd));
      itemToAdd.q--;
    }
    handleCalculateCartStuff();
    cartStore.dispatch({ type: 'SET_LAST_SELECTED', payload: selItem });
  }
});

const cartDisp = document.getElementById('cart-items');
cartDisp.addEventListener('click', function (event) {
  const tgt = event.target;
  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    const prod = prodList.find((product) => product.id === prodId);
    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      const qtyElem = itemElem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.q + currentQty) {
        qtyElem.textContent = newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        prod.q += currentQty;
        itemElem.remove();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      const qtyElem = itemElem.querySelector('.quantity-number');
      const remQty = parseInt(qtyElem.textContent);
      prod.q += remQty;
      itemElem.remove();
    }

    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
