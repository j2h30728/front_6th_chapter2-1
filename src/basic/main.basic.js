import createObserver from './utils/createObserver.js';
import createStore from './utils/createStore.js';

// 🏪 상품 ID 상수 - 일관된 네이밍으로 통일
const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_POUCH: 'p4',
  SPEAKER: 'p5',
};

// 🏪 할인 정책 설정
const DISCOUNT_POLICIES = {
  // 개별 상품 할인율 (10개 이상 구매 시)
  INDIVIDUAL_DISCOUNTS: {
    [PRODUCT_IDS.KEYBOARD]: 0.1, // 10%
    [PRODUCT_IDS.MOUSE]: 0.15, // 15%
    [PRODUCT_IDS.MONITOR_ARM]: 0.2, // 20%
    [PRODUCT_IDS.LAPTOP_POUCH]: 0.05, // 5%
    [PRODUCT_IDS.SPEAKER]: 0.25, // 25%
  },

  // 대량 구매 할인
  BULK_DISCOUNT: {
    THRESHOLD: 30, // 30개 이상
    RATE: 0.25, // 25%
  },

  // 특별 할인
  SPECIAL_DISCOUNTS: {
    TUESDAY: {
      RATE: 0.1, // 10%
      DAY_OF_WEEK: 2, // 화요일 (0=일요일, 1=월요일, 2=화요일)
    },
    LIGHTNING_SALE: {
      RATE: 0.2, // 20%
    },
    RECOMMENDED_SALE: {
      RATE: 0.05, // 5%
    },
  },
};

// 🏪 포인트 정책 설정
const POINT_POLICIES = {
  // 기본 포인트 적립률
  BASE_RATE: 0.001, // 0.1% (1000원당 1포인트)

  // 화요일 보너스
  TUESDAY_MULTIPLIER: 2, // 2배

  // 세트 보너스
  SET_BONUSES: {
    KEYBOARD_MOUSE: 50, // 키보드+마우스 세트
    FULL_SET: 100, // 풀세트 (키보드+마우스+모니터암)
  },

  // 수량 보너스
  QUANTITY_BONUSES: {
    [10]: 20, // 10개 이상 +20p
    [20]: 50, // 20개 이상 +50p
    [30]: 100, // 30개 이상 +100p
  },
};

// 🏪 재고 관리 설정
const STOCK_POLICIES = {
  LOW_STOCK_THRESHOLD: 5, // 5개 미만 시 재고 부족 표시
  OUT_OF_STOCK: 0, // 0개 시 품절
};

// 🏪 상품 정보 설정
const PRODUCT_DATA = {
  KEYBOARD: {
    name: '버그 없애는 키보드',
    price: 10000,
    stock: 50,
  },
  MOUSE: {
    name: '생산성 폭발 마우스',
    price: 20000,
    stock: 30,
  },
  MONITOR_ARM: {
    name: '거북목 탈출 모니터암',
    price: 30000,
    stock: 20,
  },
  LAPTOP_POUCH: {
    name: '에러 방지 노트북 파우치',
    price: 15000,
    stock: 0,
  },
  SPEAKER: {
    name: '코딩할 때 듣는 Lo-Fi 스피커',
    price: 25000,
    stock: 10,
  },
};

// 🏪 UI 설정
const UI_CONSTANTS = {
  DEFAULT_ITEM_COUNT: 0,
  DEFAULT_TOTAL_AMOUNT: 0,
  DEFAULT_ITEM_COUNT_DISPLAY: '🛍️ 0 items in cart',
  DEFAULT_POINTS_DISPLAY: '적립 포인트: 0p',
  QUANTITY_THRESHOLD_FOR_BOLD: 10,
  TOTAL_STOCK_WARNING_THRESHOLD: 50,
};

// 🏪 타이머 설정
const TIMER_SETTINGS = {
  LIGHTNING_SALE_INTERVAL: 30000, // 30초
  LIGHTNING_SALE_DELAY_MAX: 10000, // 최대 10초 지연
  RECOMMENDED_SALE_INTERVAL: 60000, // 60초
  RECOMMENDED_SALE_DELAY_MAX: 20000, // 최대 20초 지연
};

// 🏪 데이터 변환 함수들
const transformServerDataToClientState = (serverData) => {
  return Object.entries(serverData).map(([key, data]) => ({
    id: PRODUCT_IDS[key],
    name: data.name,
    val: data.price,
    originalVal: data.price,
    q: data.stock,
    onSale: false,
    suggestSale: false,
  }));
};

const createInitialProductState = () => {
  return transformServerDataToClientState(PRODUCT_DATA);
};

// 🏪 할인 계산 모듈
const discountCalculator = {
  // 개별 상품 할인 계산
  calculateIndividualDiscount: (productId, quantity) => {
    if (quantity < UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD) return 0;
    return DISCOUNT_POLICIES.INDIVIDUAL_DISCOUNTS[productId] || 0;
  },

  // 대량 구매 할인 계산
  calculateBulkDiscount: (totalItems) => {
    return totalItems >= DISCOUNT_POLICIES.BULK_DISCOUNT.THRESHOLD ? DISCOUNT_POLICIES.BULK_DISCOUNT.RATE : 0;
  },

  // 화요일 할인 계산
  calculateTuesdayDiscount: (subtotal) => {
    const today = new Date();
    const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
    return isTuesday && subtotal > 0 ? DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.RATE : 0;
  },

  // 최종 할인 적용
  applyDiscounts: (subtotal, itemDiscounts, totalItems) => {
    const bulkDiscount = discountCalculator.calculateBulkDiscount(totalItems);
    const tuesdayDiscount = discountCalculator.calculateTuesdayDiscount(subtotal);

    let finalTotal = subtotal;

    // 개별 상품 할인 적용 (대량 할인이 없을 때만)
    if (bulkDiscount === 0) {
      itemDiscounts.forEach((discount) => {
        finalTotal -= (subtotal * discount.discount) / 100;
      });
    }

    // 대량 할인 적용
    if (bulkDiscount > 0) {
      finalTotal = subtotal * (1 - bulkDiscount);
    }

    // 화요일 할인 적용
    if (tuesdayDiscount > 0) {
      finalTotal = finalTotal * (1 - tuesdayDiscount);
    }

    return {
      finalTotal,
      isTuesday: new Date().getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK,
      bulkDiscount,
      tuesdayDiscount,
    };
  },

  // 할인 정보 생성
  createDiscountInfo: (cartItems) => {
    return Array.from(cartItems)
      .map((cartItem) => {
        const curItem = productStore.getState().products.find((product) => product.id === cartItem.id);
        const qtyElem = cartItem.querySelector('.quantity-number');
        const quantity = parseInt(qtyElem.textContent);
        const discount = discountCalculator.calculateIndividualDiscount(curItem.id, quantity);

        return discount > 0 ? { name: curItem.name, discount: discount * 100 } : null;
      })
      .filter(Boolean);
  },
};

// 🏪 포인트 계산 모듈
const pointCalculator = {
  // 기본 포인트 계산
  calculateBasePoints: (finalTotal) => {
    return Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);
  },

  // 화요일 보너스 계산
  calculateTuesdayBonus: (basePoints, isTuesday) => {
    return isTuesday ? basePoints * POINT_POLICIES.TUESDAY_MULTIPLIER : basePoints;
  },

  // 세트 보너스 계산
  calculateSetBonus: (cartItems) => {
    const productTypes = cartItems
      .map((cartItem) => {
        const product = productStore.getState().products.find((item) => item.id === cartItem.id);
        return product ? product.id : null;
      })
      .filter(Boolean)
      .reduce(
        (types, productId) => {
          if (productId === PRODUCT_IDS.KEYBOARD) types.hasKeyboard = true;
          else if (productId === PRODUCT_IDS.MOUSE) types.hasMouse = true;
          else if (productId === PRODUCT_IDS.MONITOR_ARM) types.hasMonitorArm = true;
          return types;
        },
        { hasKeyboard: false, hasMouse: false, hasMonitorArm: false }
      );

    let bonus = 0;
    if (productTypes.hasKeyboard && productTypes.hasMouse) {
      bonus += POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE;
    }
    if (productTypes.hasKeyboard && productTypes.hasMouse && productTypes.hasMonitorArm) {
      bonus += POINT_POLICIES.SET_BONUSES.FULL_SET;
    }

    return bonus;
  },

  // 수량 보너스 계산
  calculateQuantityBonus: (totalItems) => {
    const quantityThresholds = Object.keys(POINT_POLICIES.QUANTITY_BONUSES)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of quantityThresholds) {
      if (totalItems >= threshold) {
        return POINT_POLICIES.QUANTITY_BONUSES[threshold];
      }
    }
    return 0;
  },

  // 총 포인트 계산
  calculateTotalPoints: (finalTotal, cartItems, totalItems, isTuesday) => {
    const basePoints = pointCalculator.calculateBasePoints(finalTotal);
    const tuesdayPoints = pointCalculator.calculateTuesdayBonus(basePoints, isTuesday);
    const setBonus = pointCalculator.calculateSetBonus(cartItems);
    const quantityBonus = pointCalculator.calculateQuantityBonus(totalItems);

    return tuesdayPoints + setBonus + quantityBonus;
  },

  // 포인트 상세 내역 생성
  createPointsDetail: (finalTotal, cartItems, totalItems, isTuesday) => {
    const pointsDetail = [];
    const basePoints = pointCalculator.calculateBasePoints(finalTotal);

    if (basePoints > 0) {
      pointsDetail.push('기본: ' + basePoints + 'p');
    }

    if (isTuesday && basePoints > 0) {
      pointsDetail.push('화요일 2배');
    }

    const setBonus = pointCalculator.calculateSetBonus(cartItems);
    if (setBonus > 0) {
      if (setBonus >= POINT_POLICIES.SET_BONUSES.FULL_SET) {
        pointsDetail.push('풀세트 구매 +100p');
      } else if (setBonus >= POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE) {
        pointsDetail.push('키보드+마우스 세트 +50p');
      }
    }

    const quantityBonus = pointCalculator.calculateQuantityBonus(totalItems);
    if (quantityBonus > 0) {
      if (totalItems >= 30) {
        pointsDetail.push('대량구매(30개+) +100p');
      } else if (totalItems >= 20) {
        pointsDetail.push('대량구매(20개+) +50p');
      } else if (totalItems >= 10) {
        pointsDetail.push('대량구매(10개+) +20p');
      }
    }

    return pointsDetail;
  },
};

// 🏪 이벤트 핸들러 모듈
const eventHandlers = {
  // 매뉴얼 토글 이벤트 핸들러
  handleManualToggle: () => {
    uiStore.dispatch({ type: 'TOGGLE_MANUAL_OVERLAY' });
    const isVisible = uiStore.getState().isManualOverlayVisible;
    const manualOverlay = document.getElementById('manual-overlay');
    const manualColumn = document.getElementById('manual-column');

    if (isVisible) {
      manualOverlay.classList.remove('hidden');
      manualColumn.classList.remove('translate-x-full');
    } else {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  },

  // 매뉴얼 오버레이 배경 클릭 이벤트 핸들러
  handleManualOverlayClick: (event) => {
    if (event.target === event.currentTarget) {
      uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
      const manualOverlay = document.getElementById('manual-overlay');
      const manualColumn = document.getElementById('manual-column');
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  },

  // 장바구니 추가 이벤트 핸들러
  handleAddToCart: () => {
    const sel = document.getElementById('product-select');
    const selItem = sel.value;
    const hasItem = productStore.getState().products.some((product) => product.id === selItem);

    if (!selItem || !hasItem) {
      return;
    }

    const itemToAdd = productStore.getState().products.find((product) => product.id === selItem);
    if (itemToAdd && itemToAdd.q > 0) {
      const item = document.getElementById(itemToAdd['id']);
      if (item) {
        // 기존 아이템 수량 증가
        const qtyElem = item.querySelector('.quantity-number');
        const newQty = parseInt(qtyElem['textContent']) + 1;
        if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
          qtyElem.textContent = newQty;
          productStore.dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId: itemToAdd.id, quantity: 1 },
          });
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        // 새 아이템 추가
        const cartDisp = document.getElementById('cart-items');
        cartDisp.insertAdjacentHTML('beforeend', createCartItemHTML(itemToAdd));
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemToAdd.id, quantity: 1 },
        });
      }
      handleCalculateCartStuff();
      cartStore.dispatch({ type: 'SET_LAST_SELECTED', payload: selItem });
    }
  },

  // 장바구니 아이템 클릭 이벤트 핸들러
  handleCartItemClick: (event) => {
    const tgt = event.target;
    if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
      const prodId = tgt.dataset.productId;
      const itemElem = document.getElementById(prodId);
      const prod = productStore.getState().products.find((product) => product.id === prodId);

      if (tgt.classList.contains('quantity-change')) {
        // 수량 변경
        const qtyChange = parseInt(tgt.dataset.change);
        const qtyElem = itemElem.querySelector('.quantity-number');
        const currentQty = parseInt(qtyElem.textContent);
        const newQty = currentQty + qtyChange;

        if (newQty > 0 && newQty <= prod.q + currentQty) {
          qtyElem.textContent = newQty;
          productStore.dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId: prodId, quantity: qtyChange },
          });
        } else if (newQty <= 0) {
          productStore.dispatch({
            type: 'INCREASE_STOCK',
            payload: { productId: prodId, quantity: currentQty },
          });
          itemElem.remove();
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (tgt.classList.contains('remove-item')) {
        // 아이템 제거
        const qtyElem = itemElem.querySelector('.quantity-number');
        const remQty = parseInt(qtyElem.textContent);
        productStore.dispatch({
          type: 'INCREASE_STOCK',
          payload: { productId: prodId, quantity: remQty },
        });
        itemElem.remove();
      }

      handleCalculateCartStuff();
      onUpdateSelectOptions();
    }
  },

  // 이벤트 리스너 등록
  registerEventListeners: () => {
    const manualToggle = document.getElementById('manual-toggle');
    const manualOverlay = document.getElementById('manual-overlay');
    const addBtn = document.getElementById('add-to-cart');
    const cartDisp = document.getElementById('cart-items');

    manualToggle.onclick = eventHandlers.handleManualToggle;
    manualOverlay.onclick = eventHandlers.handleManualOverlayClick;
    addBtn.addEventListener('click', eventHandlers.handleAddToCart);
    cartDisp.addEventListener('click', eventHandlers.handleCartItemClick);
  },
};

// 🏪 Cart Store - 장바구니 상태 관리
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEM_COUNT':
      return { ...state, itemCnt: action.payload };
    case 'RESET_ITEM_COUNT':
      return { ...state, itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT };
    case 'ADD_TO_ITEM_COUNT':
      return { ...state, itemCnt: state.itemCnt + action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmt: action.payload };
    case 'ADD_TO_TOTAL_AMOUNT':
      return { ...state, totalAmt: state.totalAmt + action.payload };
    case 'SET_LAST_SELECTED':
      return { ...state, lastSel: action.payload };
    case 'RESET_CART':
      return {
        ...state,
        itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
        totalAmt: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
        lastSel: null,
      };
    default:
      return state;
  }
};

const cartStore = createStore(cartReducer, {
  itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
  totalAmt: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
  lastSel: null,
});

// 🏪 Product Store - 상품 재고 및 상태 관리
const productReducer = (state, action) => {
  switch (action.type) {
    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, q: Math.max(0, product.q - action.payload.quantity) }
            : product
        ),
      };
    case 'INCREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, q: product.q + action.payload.quantity } : product
        ),
      };
    case 'SET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: action.payload.newPrice,
                onSale: action.payload.onSale,
                suggestSale: action.payload.suggestSale || product.suggestSale,
              }
            : product
        ),
      };
    case 'RESET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: product.originalVal,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };
    case 'SET_PRODUCT_PRICE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, val: action.payload.price } : product
        ),
      };
    case 'RESET_PRODUCT_PRICE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, val: product.originalVal } : product
        ),
      };
    case 'SET_SALE_STATUS':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                onSale: action.payload.onSale || false,
                suggestSale: action.payload.suggestSale || false,
              }
            : product
        ),
      };
    case 'RESET_SALE_STATUS':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };
    default:
      return state;
  }
};

const productStore = createStore(productReducer, {
  products: createInitialProductState(),
});

// 🏪 UI Store - UI 상태 관리
const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_MANUAL_OVERLAY':
      return { ...state, isManualOverlayVisible: !state.isManualOverlayVisible };
    case 'SET_MANUAL_OVERLAY_VISIBLE':
      return { ...state, isManualOverlayVisible: action.payload };
    case 'TOGGLE_TUESDAY_SPECIAL':
      return { ...state, isTuesdaySpecialVisible: action.payload };
    case 'SET_DISCOUNT_INFO_VISIBLE':
      return { ...state, isDiscountInfoVisible: action.payload };
    case 'SET_STOCK_MESSAGE':
      return { ...state, stockMessage: action.payload };
    case 'SET_ITEM_COUNT_DISPLAY':
      return { ...state, itemCountDisplay: action.payload };
    case 'SET_POINTS_DISPLAY':
      return { ...state, pointsDisplay: action.payload };
    case 'RESET_UI_STATE':
      return {
        ...state,
        isManualOverlayVisible: false,
        isTuesdaySpecialVisible: false,
        isDiscountInfoVisible: false,
        stockMessage: '',
        itemCountDisplay: UI_CONSTANTS.DEFAULT_ITEM_COUNT_DISPLAY,
        pointsDisplay: UI_CONSTANTS.DEFAULT_POINTS_DISPLAY,
      };
    default:
      return state;
  }
};

const uiStore = createStore(uiReducer, {
  isManualOverlayVisible: false,
  isTuesdaySpecialVisible: false,
  isDiscountInfoVisible: false,
  stockMessage: '',
  itemCountDisplay: UI_CONSTANTS.DEFAULT_ITEM_COUNT_DISPLAY,
  pointsDisplay: UI_CONSTANTS.DEFAULT_POINTS_DISPLAY,
});

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

  // 🔍 Observers 활성화 - DOM 준비 후
  const cartObserver = createObserver(cartStore, (state) => {
    // 장바구니 상태 변경 시 UI 업데이트
    const itemCountElement = document.getElementById('item-count');
    if (itemCountElement) {
      itemCountElement.textContent = '🛍️ ' + state.itemCnt + ' items in cart';
    }

    // 총액 변경 시 UI 업데이트
    const totalDiv = document.getElementById('cart-total')?.querySelector('.text-2xl');
    if (totalDiv) {
      totalDiv.textContent = '₩' + Math.round(state.totalAmt).toLocaleString();
    }

    // 포인트 계산 및 표시
    const loyaltyPointsDiv = document.getElementById('loyalty-points');
    if (loyaltyPointsDiv) {
      const points = Math.floor(state.totalAmt / 1000);
      const pointsDisplay = points > 0 ? `적립 포인트: ${points}p` : '적립 포인트: 0p';
      loyaltyPointsDiv.textContent = pointsDisplay;
      loyaltyPointsDiv.style.display = 'block';
    }
  });

  const productObserver = createObserver(productStore, () => {
    // 상품 상태 변경 시 UI 업데이트
    onUpdateSelectOptions();
    doUpdatePricesInCart();
    handleCalculateCartStuff();
  });

  const uiObserver = createObserver(uiStore, (state) => {
    // UI 상태 변경 시 DOM 업데이트
    const overlayElement = document.getElementById('manual-overlay');
    const columnElement = document.getElementById('manual-column');

    if (overlayElement && columnElement) {
      if (state.isManualOverlayVisible) {
        overlayElement.classList.remove('hidden');
        columnElement.classList.remove('translate-x-full');
      } else {
        overlayElement.classList.add('hidden');
        columnElement.classList.add('translate-x-full');
      }
    }

    // 화요일 할인 표시
    const tuesdaySpecial = document.getElementById('tuesday-special');
    if (tuesdaySpecial) {
      if (state.isTuesdaySpecialVisible) {
        tuesdaySpecial.classList.remove('hidden');
      } else {
        tuesdaySpecial.classList.add('hidden');
      }
    }

    // 재고 메시지 표시
    const stockInfo = document.getElementById('stock-status');
    if (stockInfo) {
      stockInfo.textContent = state.stockMessage;
    }
  });

  // Observer 활성화 (실제로 사용되도록)
  cartObserver.subscribe();
  productObserver.subscribe();
  uiObserver.subscribe();

  // 이벤트 리스너 등록
  eventHandlers.registerEventListeners();

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  const lightningDelay = Math.random() * TIMER_SETTINGS.LIGHTNING_SALE_DELAY_MAX;

  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * productStore.getState().products.length);
      const luckyItem = productStore.getState().products[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        const newPrice = Math.round(
          luckyItem.originalVal * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.LIGHTNING_SALE.RATE)
        );

        // 가격 변경
        productStore.dispatch({
          type: 'SET_PRODUCT_PRICE',
          payload: {
            productId: luckyItem.id,
            price: newPrice,
          },
        });

        // 상태 변경 (번개세일)
        productStore.dispatch({
          type: 'SET_SALE_STATUS',
          payload: {
            productId: luckyItem.id,
            onSale: true,
            suggestSale: false,
          },
        });

        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMER_SETTINGS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);

  setTimeout(function () {
    setInterval(function () {
      if (cartStore.getState().lastSel) {
        let suggest = null;
        for (let k = 0; k < productStore.getState().products.length; k++) {
          if (productStore.getState().products[k].id !== cartStore.getState().lastSel) {
            if (productStore.getState().products[k].q > 0) {
              if (!productStore.getState().products[k].suggestSale) {
                suggest = productStore.getState().products[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          const newPrice = Math.round(suggest.val * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.RECOMMENDED_SALE.RATE));

          // 가격 변경
          productStore.dispatch({
            type: 'SET_PRODUCT_PRICE',
            payload: {
              productId: suggest.id,
              price: newPrice,
            },
          });

          // 상태 변경 (추천할인)
          productStore.dispatch({
            type: 'SET_SALE_STATUS',
            payload: {
              productId: suggest.id,
              onSale: false,
              suggestSale: true,
            },
          });
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, TIMER_SETTINGS.RECOMMENDED_SALE_INTERVAL);
  }, Math.random() * TIMER_SETTINGS.RECOMMENDED_SALE_DELAY_MAX);
}

function onUpdateSelectOptions() {
  const sel = document.getElementById('product-select');

  // 전체 재고 계산
  const totalStock = productStore.getState().products.reduce((total, product) => total + product.q, 0);

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
  sel.innerHTML = productStore.getState().products.map(createOptionHTML).join('');

  // 재고 상태에 따른 스타일 적용
  sel.style.borderColor = totalStock < UI_CONSTANTS.TOTAL_STOCK_WARNING_THRESHOLD ? 'orange' : '';
}

// 📊 주문 요약 HTML 헬퍼 함수들
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

// 📦 재고 상태 헬퍼 함수
const createStockMessage = (item) => {
  if (item.q === 0) {
    return `${item.name}: 품절`;
  } else if (item.q < 5) {
    return `${item.name}: 재고 부족 (${item.q}개 남음)`;
  }
  return null; // 재고 충분한 경우
};

// 📊 계산 로직 함수들 - 순수 함수로 분리
const calculateCartItems = (cartItems) => {
  const cartData = Array.from(cartItems).reduce(
    (acc, cartItem) => {
      const curItem = productStore.getState().products.find((product) => product.id === cartItem.id);
      const qtyElem = cartItem.querySelector('.quantity-number');
      const quantity = parseInt(qtyElem.textContent);
      const itemTotal = curItem.val * quantity;

      return {
        subtotal: acc.subtotal + itemTotal,
        totalItems: acc.totalItems + quantity,
      };
    },
    { subtotal: 0, totalItems: 0 }
  );

  const itemDiscounts = discountCalculator.createDiscountInfo(cartItems);
  return { ...cartData, itemDiscounts };
};

const calculateFinalTotal = (subtotal, itemDiscounts, totalItems) => {
  return discountCalculator.applyDiscounts(subtotal, itemDiscounts, totalItems);
};

const calculateTotalPoints = (finalTotal, cartItems, totalItems, isTuesday) => {
  return pointCalculator.calculateTotalPoints(finalTotal, cartItems, totalItems, isTuesday);
};

// 🎨 UI 업데이트 함수들
const updateCartDisplay = (totalItems, finalTotal) => {
  cartStore.dispatch({ type: 'SET_TOTAL_AMOUNT', payload: finalTotal });
  cartStore.dispatch({ type: 'SET_ITEM_COUNT', payload: totalItems });

  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = '🛍️ ' + totalItems + ' items in cart';
  }

  const totalDiv = document.getElementById('cart-total')?.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(finalTotal).toLocaleString();
  }
};

const updateTuesdaySpecialDisplay = (isTuesday, finalTotal) => {
  const tuesdaySpecial = document.getElementById('tuesday-special');
  if (tuesdaySpecial) {
    if (isTuesday && finalTotal > 0) {
      uiStore.dispatch({ type: 'TOGGLE_TUESDAY_SPECIAL', payload: true });
      tuesdaySpecial.classList.remove('hidden');
    } else {
      uiStore.dispatch({ type: 'TOGGLE_TUESDAY_SPECIAL', payload: false });
      tuesdaySpecial.classList.add('hidden');
    }
  }
};

const updateSummaryDetails = (cartItems, subtotal, itemDiscounts, bulkDiscount, isTuesday, finalTotal) => {
  const summaryDetails = document.getElementById('summary-details');

  if (subtotal <= 0) {
    summaryDetails.innerHTML = '';
    return;
  }

  const summaryItems = Array.from(cartItems).map((cartItem) => {
    const curItem = productStore.getState().products.find((product) => product.id === cartItem.id);
    const qtyElem = cartItem.querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    return createSummaryItemHTML(curItem, quantity);
  });

  const discountItems = bulkDiscount > 0 ? [createBulkDiscountHTML()] : itemDiscounts.map(createItemDiscountHTML);

  const specialItems = isTuesday && finalTotal > 0 ? [createTuesdayDiscountHTML()] : [];

  const allItems = [
    ...summaryItems,
    createSummarySubtotalHTML(subtotal),
    ...discountItems,
    ...specialItems,
    createShippingHTML(),
  ];

  summaryDetails.innerHTML = allItems.join('');
};

const updatePointsDisplay = (totalPoints) => {
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    const pointsDisplay = totalPoints > 0 ? `적립 포인트: ${totalPoints}p` : '적립 포인트: 0p';
    uiStore.dispatch({ type: 'SET_POINTS_DISPLAY', payload: pointsDisplay });
    loyaltyPointsDiv.textContent = pointsDisplay;
    loyaltyPointsDiv.style.display = 'block';
  }
};

const updateDiscountInfo = (subtotal, finalTotal) => {
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  const totalDiscountRate = (subtotal - finalTotal) / subtotal;
  if (totalDiscountRate > 0 && finalTotal > 0) {
    const savedAmount = subtotal - finalTotal;
    uiStore.dispatch({ type: 'SET_DISCOUNT_INFO_VISIBLE', payload: true });
    discountInfoDiv.innerHTML = /*html*/ `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  } else {
    uiStore.dispatch({ type: 'SET_DISCOUNT_INFO_VISIBLE', payload: false });
  }
};

const updateStockMessages = () => {
  const stockMessages = productStore
    .getState()
    .products.filter((item) => item.q < STOCK_POLICIES.LOW_STOCK_THRESHOLD)
    .map((item) => {
      if (item.q > STOCK_POLICIES.OUT_OF_STOCK) {
        return `${item.name}: 재고 부족 (${item.q}개 남음)`;
      } else {
        return `${item.name}: 품절`;
      }
    });

  const stockMsg = stockMessages.join('\n');
  const stockInfo = document.getElementById('stock-status');
  uiStore.dispatch({ type: 'SET_STOCK_MESSAGE', payload: stockMsg });
  stockInfo.textContent = stockMsg;
  handleStockInfoUpdate();
};

const updateCartItemStyles = (cartItems) => {
  Array.from(cartItems).forEach((cartItem) => {
    const qtyElem = cartItem.querySelector('.quantity-number');
    const quantity = parseInt(qtyElem.textContent);
    const priceElems = cartItem.querySelectorAll('.text-lg, .text-xs');

    priceElems.forEach((elem) => {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight = quantity >= UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD ? 'bold' : 'normal';
      }
    });
  });
};

// 🎯 메인 계산 함수 - 이제 조율자 역할만 수행
function handleCalculateCartStuff() {
  const cartDisp = document.getElementById('cart-items');
  const cartItems = cartDisp.children;

  // 1. 장바구니 아이템 계산
  const { subtotal, totalItems, itemDiscounts } = calculateCartItems(cartItems);

  // 2. 최종 총액 계산
  const { finalTotal, isTuesday, bulkDiscount } = calculateFinalTotal(subtotal, itemDiscounts, totalItems);

  // 3. 포인트 계산
  const totalPoints = calculateTotalPoints(finalTotal, Array.from(cartItems), totalItems, isTuesday);

  // 4. UI 업데이트
  updateCartDisplay(totalItems, finalTotal);
  updateTuesdaySpecialDisplay(isTuesday, finalTotal);
  updateSummaryDetails(cartItems, subtotal, itemDiscounts, bulkDiscount, isTuesday, finalTotal);
  updatePointsDisplay(totalPoints);
  updateDiscountInfo(subtotal, finalTotal);
  updateStockMessages();
  updateCartItemStyles(cartItems);

  // 5. 보너스 포인트 렌더링
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
  const stockMessages = productStore
    .getState()
    .products.filter((item) => item.q < STOCK_POLICIES.LOW_STOCK_THRESHOLD)
    .map(createStockMessage)
    .filter(Boolean);

  const stockInfo = document.getElementById('stock-status');
  stockInfo.textContent = stockMessages.join('\n');
};

// 💰 포인트 계산 헬퍼 함수
const calculateBonusPoints = () => {
  const cartDisp = document.getElementById('cart-items');
  const cartItems = Array.from(cartDisp.children);

  if (cartItems.length === 0) {
    return { finalPoints: 0, pointsDetail: [] };
  }

  const totalAmount = cartStore.getState().totalAmt;
  const totalItems = cartStore.getState().itemCnt;
  const isTuesday = new Date().getDay() === 2;

  // 새로운 계산 함수 사용
  const finalPoints = calculateTotalPoints(totalAmount, cartItems, totalItems, isTuesday);

  // 포인트 상세 내역 생성
  const pointsDetail = [];
  const basePoints = Math.floor(totalAmount / 1000);

  if (basePoints > 0) {
    pointsDetail.push('기본: ' + basePoints + 'p');
  }

  if (isTuesday && basePoints > 0) {
    pointsDetail.push('화요일 2배');
  }

  const setBonus = pointCalculator.calculateSetBonus(cartItems);
  if (setBonus > 0) {
    if (setBonus >= POINT_POLICIES.SET_BONUSES.FULL_SET) {
      pointsDetail.push('풀세트 구매 +100p');
    } else if (setBonus >= POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE) {
      pointsDetail.push('키보드+마우스 세트 +50p');
    }
  }

  const quantityBonus = pointCalculator.calculateQuantityBonus(totalItems);
  if (quantityBonus > 0) {
    if (totalItems >= 30) {
      pointsDetail.push('대량구매(30개+) +100p');
    } else if (totalItems >= 20) {
      pointsDetail.push('대량구매(20개+) +50p');
    } else if (totalItems >= 10) {
      pointsDetail.push('대량구매(10개+) +20p');
    }
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
  cartItems
    .map((cartItem) => ({
      cartItem,
      product: productStore.getState().products.find((item) => item.id === cartItem.id),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      updateCartItemPrice(cartItem, product);
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
