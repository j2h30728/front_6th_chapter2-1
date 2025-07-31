import { createBulkDiscountHTML } from './components/BulkDiscount.js';
import { createCartItems } from './components/CartItems.js';
// 🧩 컴포넌트 imports
import { createHeader } from './components/Header.js';
import { createItemDiscountHTML } from './components/ItemDiscount.js';
import { createManualOverlay } from './components/ManualOverlay.js';
import { createManualToggleButton } from './components/ManualToggle.js';
import { createProductSelector } from './components/ProductSelector.js';
import { createRightColumn } from './components/RightColumn.js';
import { createShippingHTML } from './components/Shipping.js';
import { createSummaryItemHTML } from './components/SummaryItem.js';
import { createSummarySubtotalHTML } from './components/SummarySubtotal.js';
import { createTuesdayDiscountHTML } from './components/TuesdayDiscount.js';
// 🏪 상수들 import
import {
  DISCOUNT_POLICIES,
  POINT_POLICIES,
  PRODUCT_DATA,
  PRODUCT_IDS,
  STOCK_POLICIES,
  TIMER_SETTINGS,
  UI_CONSTANTS,
} from './constants/index.js';
// 🛠️ 순수 유틸리티 함수들 import
import { createCartItemHTML, getQuantityFromCartItem, setQuantityToCartItem } from './features/cart/cartUtils.js';
// 🎯 기능별 함수들 import
import { createStockMessage, findProductById, getPriceHTML, getSaleIcon } from './features/product/productUtils.js';
import createObserver from './utils/createObserver.js';
import createStore from './utils/createStore.js';
import { formatNumber, formatPrice, safeParseInt, when, whenValue } from './utils/dataUtils.js';
import { getElement, querySelector, setInnerHTML, setStyle, setTextContent } from './utils/domUtils.js';

// 🎯 도메인별 함수들
const domainUtils = {
  getQuantityFromCartItem,
  setQuantityToCartItem,
  findProductById: (productId) => findProductById(productId, productStore.getState().products),
  getSaleIcon,
  getPriceHTML,
  createStockMessage,
  createCartItemHTML,
};

// 🏪 UI 렌더링 모듈 (React 스타일)
const uiRenderer = {
  // 상태 기반 UI 업데이트
  renderCartDisplay: (totalItems, finalTotal) => {
    setTextContent('item-count', `🛍️ ${totalItems} items in cart`);

    const totalDiv = querySelector(getElement('cart-total'), '.text-2xl');
    if (totalDiv) {
      totalDiv.textContent = formatPrice(finalTotal);
    }
  },

  renderPointsDisplay: (totalPoints) => {
    const pointsDisplay = whenValue(totalPoints > 0, `적립 포인트: ${totalPoints}p`, '적립 포인트: 0p');
    setTextContent('loyalty-points', pointsDisplay);
    setStyle('loyalty-points', 'display', 'block');
  },

  renderTuesdaySpecial: (isTuesday, finalTotal) => {
    const tuesdaySpecial = getElement('tuesday-special');
    if (tuesdaySpecial) {
      if (isTuesday && finalTotal > 0) {
        tuesdaySpecial.classList.remove('hidden');
      } else {
        tuesdaySpecial.classList.add('hidden');
      }
    }
  },

  renderStockMessages: (stockMessages) => {
    const stockMsg = stockMessages.join('\n');
    setTextContent('stock-status', stockMsg);
  },

  renderSummaryDetails: (summaryItems) => {
    setInnerHTML('summary-details', summaryItems.join(''));
  },

  renderDiscountInfo: (totalDiscountRate, savedAmount) => {
    const discountInfoDiv = getElement('discount-info');
    if (totalDiscountRate > 0 && savedAmount > 0) {
      discountInfoDiv.innerHTML = /*html*/ `
        <div class="bg-green-500/20 rounded-lg p-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
            <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
          </div>
          <div class="text-2xs text-gray-300">₩${formatNumber(savedAmount)} 할인되었습니다</div>
        </div>
      `;
    } else {
      discountInfoDiv.innerHTML = '';
    }
  },

  renderCartItemStyles: (cartItems) => {
    Array.from(cartItems).forEach((cartItem) => {
      const quantity = domainUtils.getQuantityFromCartItem(cartItem);
      const priceElems = cartItem.querySelectorAll('.text-lg, .text-xs');

      priceElems.forEach((elem) => {
        if (elem.classList.contains('text-lg')) {
          elem.style.fontWeight = whenValue(quantity >= UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD, 'bold', 'normal');
        }
      });
    });
  },

  renderManualOverlay: (isVisible) => {
    const manualOverlay = getElement('manual-overlay');
    const manualColumn = getElement('manual-column');

    when(isVisible, () => {
      manualOverlay.classList.remove('hidden');
      manualColumn.classList.remove('translate-x-full');
    });

    when(!isVisible, () => {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    });
  },
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
        const curItem = domainUtils.findProductById(cartItem.id);
        const quantity = domainUtils.getQuantityFromCartItem(cartItem);
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
      .map((cartItem) => domainUtils.findProductById(cartItem.id))
      .filter(Boolean)
      .reduce(
        (types, product) => {
          if (product.id === PRODUCT_IDS.KEYBOARD) types.hasKeyboard = true;
          else if (product.id === PRODUCT_IDS.MOUSE) types.hasMouse = true;
          else if (product.id === PRODUCT_IDS.MONITOR_ARM) types.hasMonitorArm = true;
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

// 🏪 이벤트 시스템
const eventSystem = {
  // 이벤트 타입 상수
  EVENT_TYPES: {
    CART_ADD_ITEM: 'CART_ADD_ITEM',
    CART_REMOVE_ITEM: 'CART_REMOVE_ITEM',
    CART_UPDATE_QUANTITY: 'CART_UPDATE_QUANTITY',
    MANUAL_TOGGLE: 'MANUAL_TOGGLE',
    MANUAL_CLOSE: 'MANUAL_CLOSE',
    PRODUCT_SELECT: 'PRODUCT_SELECT',
    LIGHTNING_SALE: 'LIGHTNING_SALE',
    RECOMMENDED_SALE: 'RECOMMENDED_SALE',
  },

  // 이벤트 리스너 저장소
  listeners: new Map(),

  // 이벤트 등록
  on: (eventType, callback) => {
    if (!eventSystem.listeners.has(eventType)) {
      eventSystem.listeners.set(eventType, []);
    }
    eventSystem.listeners.get(eventType).push(callback);
  },

  // 이벤트 발생
  emit: (eventType, data) => {
    const callbacks = eventSystem.listeners.get(eventType) || [];
    callbacks.forEach((callback) => callback(data));
  },

  // 이벤트 리스너 제거
  off: (eventType, callback) => {
    const callbacks = eventSystem.listeners.get(eventType) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  },

  // 모든 이벤트 리스너 제거
  clear: () => {
    eventSystem.listeners.clear();
  },
};

// 🏪 이벤트 핸들러 모듈
const eventHandlers = {
  // 매뉴얼 토글 이벤트 핸들러
  handleManualToggle: () => {
    eventSystem.emit(eventSystem.EVENT_TYPES.MANUAL_TOGGLE);
  },

  // 매뉴얼 오버레이 배경 클릭 이벤트 핸들러
  handleManualOverlayClick: (event) => {
    if (event.target === event.currentTarget) {
      eventSystem.emit(eventSystem.EVENT_TYPES.MANUAL_CLOSE);
    }
  },

  // 장바구니 추가 이벤트 핸들러
  handleAddToCart: () => {
    const sel = getElement('product-select');
    const selItem = sel.value;
    const hasItem = productStore.getState().products.some((product) => product.id === selItem);

    if (!selItem || !hasItem) {
      return;
    }

    const itemToAdd = domainUtils.findProductById(selItem);
    if (itemToAdd && itemToAdd.q > 0) {
      eventSystem.emit(eventSystem.EVENT_TYPES.CART_ADD_ITEM, {
        productId: itemToAdd.id,
        quantity: 1,
        product: itemToAdd,
      });
    }
  },

  // 장바구니 아이템 클릭 이벤트 핸들러
  handleCartItemClick: (event) => {
    const tgt = event.target;
    if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
      const prodId = tgt.dataset.productId;
      const itemElem = getElement(prodId);
      const prod = domainUtils.findProductById(prodId);

      if (tgt.classList.contains('quantity-change')) {
        // 수량 변경
        const qtyChange = safeParseInt(tgt.dataset.change);
        const currentQty = domainUtils.getQuantityFromCartItem(itemElem);
        const newQty = currentQty + qtyChange;

        if (newQty > 0 && newQty <= prod.q + currentQty) {
          domainUtils.setQuantityToCartItem(itemElem, newQty);
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
        const remQty = domainUtils.getQuantityFromCartItem(itemElem);
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
    const manualToggle = getElement('manual-toggle');
    const manualOverlay = getElement('manual-overlay');
    const addBtn = getElement('add-to-cart');
    const cartDisp = getElement('cart-items');

    manualToggle.onclick = eventHandlers.handleManualToggle;
    manualOverlay.onclick = eventHandlers.handleManualOverlayClick;
    addBtn.addEventListener('click', eventHandlers.handleAddToCart);
    cartDisp.addEventListener('click', eventHandlers.handleCartItemClick);

    // 이벤트 시스템 리스너 등록
    eventSystem.on(eventSystem.EVENT_TYPES.MANUAL_TOGGLE, () => {
      uiStore.dispatch({ type: 'TOGGLE_MANUAL_OVERLAY' });
      const isVisible = uiStore.getState().isManualOverlayVisible;
      uiRenderer.renderManualOverlay(isVisible);
    });

    eventSystem.on(eventSystem.EVENT_TYPES.MANUAL_CLOSE, () => {
      uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
      uiRenderer.renderManualOverlay(false);
    });

    eventSystem.on(eventSystem.EVENT_TYPES.CART_ADD_ITEM, (data) => {
      const { productId, quantity, product } = data;
      const item = getElement(productId);

      if (item) {
        // 기존 아이템 수량 증가
        const currentQty = domainUtils.getQuantityFromCartItem(item);
        const newQty = currentQty + quantity;
        if (newQty <= product.q + currentQty) {
          domainUtils.setQuantityToCartItem(item, newQty);
          productStore.dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId, quantity },
          });
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        // 새 아이템 추가
        const cartContainer = getElement('cart-items');
        cartContainer.insertAdjacentHTML('beforeend', domainUtils.createCartItemHTML(product));
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId, quantity },
        });
      }

      handleCalculateCartStuff();
      cartStore.dispatch({ type: 'SET_LAST_SELECTED', payload: productId });
    });
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

// 🧩 컴포넌트 조합 함수
const createMainContent = () => /*html*/ `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    ${createProductSelector()}
    ${createCartItems()}
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
    uiRenderer.renderCartDisplay(state.itemCnt, state.totalAmt);

    // 총액 변경 시 UI 업데이트
    const totalDiv = querySelector(getElement('cart-total'), '.text-2xl');
    if (totalDiv) {
      totalDiv.textContent = formatPrice(state.totalAmt);
    }

    // 포인트 계산 및 표시
    const loyaltyPointsDiv = getElement('loyalty-points');
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
    uiRenderer.renderManualOverlay(state.isManualOverlayVisible);

    // 화요일 할인 표시
    const tuesdaySpecial = getElement('tuesday-special');
    if (tuesdaySpecial) {
      if (state.isTuesdaySpecialVisible) {
        tuesdaySpecial.classList.remove('hidden');
      } else {
        tuesdaySpecial.classList.add('hidden');
      }
    }

    // 재고 메시지 표시
    const stockInfo = getElement('stock-status');
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
    const getItemSaleIcon = () => domainUtils.getSaleIcon(item);

    const getOptionClass = () => {
      if (item.q === 0) return 'text-gray-400';
      if (item.onSale && item.suggestSale) return 'text-purple-600 font-bold';
      if (item.onSale) return 'text-red-500 font-bold';
      if (item.suggestSale) return 'text-blue-500 font-bold';
      return '';
    };

    const getOptionText = () => {
      const icon = getItemSaleIcon();

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
// 📦 재고 상태 헬퍼 함수 (도메인 함수 사용)

// 📊 계산 로직 함수들 - 순수 함수로 분리
const calculateCartItems = (cartItems) => {
  const cartData = Array.from(cartItems).reduce(
    (acc, cartItem) => {
      const curItem = domainUtils.findProductById(cartItem.id);
      const quantity = domainUtils.getQuantityFromCartItem(cartItem);
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

  uiRenderer.renderCartDisplay(totalItems, finalTotal);
};

const updateTuesdaySpecialDisplay = (isTuesday, finalTotal) => {
  uiStore.dispatch({ type: 'TOGGLE_TUESDAY_SPECIAL', payload: isTuesday && finalTotal > 0 });
  uiRenderer.renderTuesdaySpecial(isTuesday, finalTotal);
};

const updateSummaryDetails = (cartItems, subtotal, itemDiscounts, bulkDiscount, isTuesday, finalTotal) => {
  if (subtotal <= 0) {
    uiRenderer.renderSummaryDetails([]);
    return;
  }

  const summaryItems = Array.from(cartItems).map((cartItem) => {
    const curItem = domainUtils.findProductById(cartItem.id);
    const quantity = domainUtils.getQuantityFromCartItem(cartItem);
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

  uiRenderer.renderSummaryDetails(allItems);
};

const updatePointsDisplay = (totalPoints) => {
  uiRenderer.renderPointsDisplay(totalPoints);
};

const updateDiscountInfo = (subtotal, finalTotal) => {
  const totalDiscountRate = (subtotal - finalTotal) / subtotal;
  const savedAmount = subtotal - finalTotal;
  uiRenderer.renderDiscountInfo(totalDiscountRate, savedAmount);
};

const updateStockMessages = () => {
  const stockMessages = productStore
    .getState()
    .products.filter((item) => item.q < STOCK_POLICIES.LOW_STOCK_THRESHOLD)
    .map(domainUtils.createStockMessage)
    .filter(Boolean);

  uiRenderer.renderStockMessages(stockMessages);
};

const updateCartItemStyles = (cartItems) => {
  uiRenderer.renderCartItemStyles(cartItems);
};

// 🎯 메인 계산 함수 - 이제 조율자 역할만 수행
function handleCalculateCartStuff() {
  const cartDisp = getElement('cart-items');
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
  const ptsTag = getElement('loyalty-points');
  if (!ptsTag) return;

  const cartDisp = getElement('cart-items');
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

// 재고 메시지 생성 헬퍼 함수 (이미 위에 정의됨)

// 💰 포인트 계산 헬퍼 함수
const calculateBonusPoints = () => {
  const cartDisp = getElement('cart-items');
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
  const priceHTML = domainUtils.getPriceHTML(product);

  // 이름에 아이콘 추가
  const icon = domainUtils.getSaleIcon(product);
  const nameText = `${icon}${product.name}`;

  // DOM 업데이트
  priceDiv.innerHTML = priceHTML;
  nameDiv.textContent = nameText;
};

// 🎨 포인트 관련 HTML 헬퍼 함수
const createBonusPointsHTML = (points, details) => /*html*/ `
  <div>적립 포인트: <span class="font-bold">${points}p</span></div>
  <div class="text-2xs opacity-70 mt-1">${details.join(', ')}</div>
`;

function doUpdatePricesInCart() {
  const cartDisp = getElement('cart-items');
  const cartItems = Array.from(cartDisp.children);

  // 각 장바구니 아이템의 가격 정보 업데이트
  cartItems
    .map((cartItem) => ({
      cartItem,
      product: domainUtils.findProductById(cartItem.id),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      updateCartItemPrice(cartItem, product);
    });

  // 전체 계산 다시 실행
  handleCalculateCartStuff();
}

// 상품 아이콘 및 가격 표시 헬퍼 함수들 (import된 함수 사용)

// 장바구니 아이템 HTML 생성 함수 (도메인 함수 사용)

//main 실행
main();
