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
import cartStore from './features/cart/cartStore.js';
// 🛠️ 순수 유틸리티 함수들 import
import { CartUtils } from './features/cart/cartUtils.js';
import { setupObservers } from './features/observerFactory.js';
import createProductStore from './features/product/productStore.js';
import { ProductUtils } from './features/product/productUtils.js';
import uiStore from './features/ui/uiStore.js';
import { formatNumber, formatPrice, safeParseInt, when, whenValue } from './utils/dataUtils.js';
import { getElement, querySelector, setInnerHTML, setStyle, setTextContent } from './utils/domUtils.js';

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
      const quantity = CartUtils.getQuantityFromCartItem(cartItem);
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

// 🏪 Product Store 초기화
const productStore = createProductStore({
  products: createInitialProductState(),
});

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
        const curItem = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
        const quantity = CartUtils.getQuantityFromCartItem(cartItem);
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
      .map((cartItem) => ProductUtils.findProductById(cartItem.id, productStore.getState().products))
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

// 🏪 이벤트 시스템 - WeakMap, Set, Map 활용
const eventSystem = {
  // WeakMap: 이벤트 엘리먼트 관리 (메모리 누수 방지)
  eventElements: new WeakMap(),

  // Set: 이벤트 타입 관리 (중복 방지)
  eventTypes: new Set(['click', 'change', 'input', 'submit', 'keydown', 'keyup', 'focus', 'blur']),

  // 이벤트 타입 동적 등록
  registerEventType: (eventType) => {
    eventSystem.eventTypes.add(eventType);
  },

  // 이벤트 타입 동적 제거
  unregisterEventType: (eventType) => {
    eventSystem.eventTypes.delete(eventType);
  },

  // 이벤트 타입 존재 여부 확인
  hasEventType: (eventType) => {
    return eventSystem.eventTypes.has(eventType);
  },

  // 등록된 모든 이벤트 타입 조회
  getRegisteredEventTypes: () => {
    return Array.from(eventSystem.eventTypes);
  },

  // Map: 이벤트 핸들러 관리 (타입별 핸들러 그룹화)
  eventHandlers: new Map(),

  // 이벤트 위임을 위한 부모 요소 탐색
  findEventTarget: (event, selector) => {
    let target = event.target;
    while (target && target !== event.currentTarget) {
      if (target.matches(selector)) {
        return target;
      }
      target = target.parentElement;
    }
    // currentTarget도 확인 (매뉴얼 오버레이 같은 경우)
    if (event.currentTarget.matches(selector)) {
      return event.currentTarget;
    }
    return null;
  },

  // 이벤트 핸들러 등록
  registerHandler: (eventType, selector, handler) => {
    // 이벤트 타입이 등록되지 않은 경우 자동 등록
    if (!eventSystem.hasEventType(eventType)) {
      eventSystem.registerEventType(eventType);
    }

    if (!eventSystem.eventHandlers.has(eventType)) {
      eventSystem.eventHandlers.set(eventType, new Map());
    }
    eventSystem.eventHandlers.get(eventType).set(selector, handler);
  },

  // 이벤트 위임 핸들러 생성
  createDelegatedHandler: (eventType) => {
    return (event) => {
      const handlers = eventSystem.eventHandlers.get(eventType);
      if (!handlers) return;

      for (const [selector, handler] of handlers) {
        const target = eventSystem.findEventTarget(event, selector);
        if (target) {
          handler(event, target);
          break;
        }
      }
    };
  },

  // 이벤트 리스너 등록
  attachEventListeners: (container) => {
    eventSystem.eventElements.set(container, new Set());

    for (const eventType of eventSystem.eventTypes) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.addEventListener(eventType, delegatedHandler);
      eventSystem.eventElements.get(container).add(eventType);
    }
  },

  // 특정 이벤트 타입 리스너 동적 등록
  attachEventListener: (container, eventType) => {
    if (!eventSystem.hasEventType(eventType)) {
      eventSystem.registerEventType(eventType);
    }

    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents && !attachedEvents.has(eventType)) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.addEventListener(eventType, delegatedHandler);
      attachedEvents.add(eventType);
    }
  },

  // 특정 이벤트 타입 리스너 동적 제거
  detachEventListener: (container, eventType) => {
    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents && attachedEvents.has(eventType)) {
      const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
      container.removeEventListener(eventType, delegatedHandler);
      attachedEvents.delete(eventType);
    }
  },

  // 이벤트 리스너 제거
  detachEventListeners: (container) => {
    const attachedEvents = eventSystem.eventElements.get(container);
    if (attachedEvents) {
      for (const eventType of attachedEvents) {
        const delegatedHandler = eventSystem.createDelegatedHandler(eventType);
        container.removeEventListener(eventType, delegatedHandler);
      }
      eventSystem.eventElements.delete(container);
    }
  },

  // 모든 이벤트 핸들러 제거
  clearHandlers: () => {
    eventSystem.eventHandlers.clear();
  },

  // 특정 이벤트 타입의 모든 핸들러 제거
  clearHandlersForEventType: (eventType) => {
    eventSystem.eventHandlers.delete(eventType);
  },

  // 특정 선택자의 핸들러 제거
  removeHandler: (eventType, selector) => {
    const handlers = eventSystem.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(selector);
      // 핸들러가 없으면 이벤트 타입도 제거
      if (handlers.size === 0) {
        eventSystem.eventHandlers.delete(eventType);
      }
    }
  },

  // 이벤트 시스템 상태 조회
  getEventSystemStatus: () => {
    return {
      registeredEventTypes: eventSystem.getRegisteredEventTypes(),
      totalHandlers: Array.from(eventSystem.eventHandlers.entries()).map(([eventType, handlers]) => ({
        eventType,
        handlerCount: handlers.size,
      })),
    };
  },
};

// 🏪 이벤트 핸들러 모듈
const eventHandlers = {
  // 매뉴얼 토글 이벤트 핸들러
  handleManualToggle: () => {
    uiStore.dispatch({ type: 'TOGGLE_MANUAL_OVERLAY' });
    const isVisible = uiStore.getState().isManualOverlayVisible;
    uiRenderer.renderManualOverlay(isVisible);
  },

  // 매뉴얼 오버레이 배경 클릭 이벤트 핸들러
  handleManualOverlayClick: (event) => {
    // 배경 클릭 시에만 모달 닫기 (event.target이 매뉴얼 오버레이 자체인 경우)
    if (event.target.id === 'manual-overlay') {
      uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
      uiRenderer.renderManualOverlay(false);
    }
  },

  // 매뉴얼 닫기 버튼 이벤트 핸들러
  handleManualClose: () => {
    uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
    uiRenderer.renderManualOverlay(false);
  },

  // 장바구니 추가 이벤트 핸들러
  handleAddToCart: () => {
    const sel = getElement('product-select');
    const selItem = sel.value;
    const hasItem = productStore.getState().products.some((product) => product.id === selItem);

    if (!selItem || !hasItem) {
      return;
    }

    const itemToAdd = ProductUtils.findProductById(selItem, productStore.getState().products);
    if (itemToAdd && itemToAdd.q > 0) {
      const cartContainer = getElement('cart-items');
      const existingItem = getElement(itemToAdd.id);

      if (existingItem) {
        // 기존 아이템 수량 증가
        const currentQty = CartUtils.getQuantityFromCartItem(existingItem);
        const newQty = currentQty + 1;
        if (newQty <= itemToAdd.q + currentQty) {
          CartUtils.setQuantityToCartItem(existingItem, newQty);
          productStore.dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId: itemToAdd.id, quantity: 1 },
          });
        } else {
          alert('재고가 부족합니다.');
          return;
        }
      } else {
        // 새 아이템 추가
        cartContainer.insertAdjacentHTML('beforeend', CartUtils.createCartItemHTML(itemToAdd));
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemToAdd.id, quantity: 1 },
        });
      }

      handleCalculateCartStuff();
      cartStore.dispatch({ type: 'SET_LAST_SELECTED', payload: itemToAdd.id });
    }
  },

  // 장바구니 아이템 클릭 이벤트 핸들러
  handleCartItemClick: (event, target) => {
    const prodId = target.dataset.productId;
    const itemElem = getElement(prodId);
    const prod = ProductUtils.findProductById(prodId, productStore.getState().products);

    if (target.classList.contains('quantity-change')) {
      // 수량 변경
      const qtyChange = safeParseInt(target.dataset.change);
      const currentQty = CartUtils.getQuantityFromCartItem(itemElem);
      const newQty = currentQty + qtyChange;

      if (newQty > 0 && newQty <= prod.q + currentQty) {
        CartUtils.setQuantityToCartItem(itemElem, newQty);
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
    } else if (target.classList.contains('remove-item')) {
      // 아이템 제거
      const remQty = CartUtils.getQuantityFromCartItem(itemElem);
      productStore.dispatch({
        type: 'INCREASE_STOCK',
        payload: { productId: prodId, quantity: remQty },
      });
      itemElem.remove();
    }

    handleCalculateCartStuff();
    onUpdateSelectOptions();
  },

  // 장바구니 아이템 호버 이벤트 핸들러 (동적 이벤트 타입 예제)
  handleCartItemHover: (event, target) => {
    target.style.transform = 'scale(1.02)';
    target.style.transition = 'transform 0.2s ease';
  },

  // 장바구니 아이템 호버 아웃 이벤트 핸들러 (동적 이벤트 타입 예제)
  handleCartItemLeave: (event, target) => {
    target.style.transform = 'scale(1)';
  },

  // 이벤트 리스너 등록
  registerEventListeners: () => {
    const appContainer = getElement('app');

    // 이벤트 위임 핸들러 등록
    eventSystem.registerHandler('click', '#manual-toggle', eventHandlers.handleManualToggle);
    eventSystem.registerHandler('click', '#manual-overlay', eventHandlers.handleManualOverlayClick);
    eventSystem.registerHandler('click', '#manual-close', eventHandlers.handleManualClose);
    eventSystem.registerHandler('click', '#add-to-cart', eventHandlers.handleAddToCart);
    eventSystem.registerHandler('click', '.quantity-change', eventHandlers.handleCartItemClick);
    eventSystem.registerHandler('click', '.remove-item', eventHandlers.handleCartItemClick);

    // 동적 이벤트 타입 등록 예제
    eventSystem.registerEventType('mouseenter');
    eventSystem.registerEventType('mouseleave');

    // 동적으로 등록된 이벤트 타입에 대한 핸들러 등록
    eventSystem.registerHandler('mouseenter', '.cart-item', eventHandlers.handleCartItemHover);
    eventSystem.registerHandler('mouseleave', '.cart-item', eventHandlers.handleCartItemLeave);

    // 이벤트 위임 리스너 등록
    eventSystem.attachEventListeners(appContainer);
  },
};

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
  setupObservers(cartStore, productStore, uiStore, uiRenderer);

  // 이벤트 위임 리스너 등록
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
    const getItemSaleIcon = () => ProductUtils.getSaleIcon(item);

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
      const curItem = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
      const quantity = CartUtils.getQuantityFromCartItem(cartItem);
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
    const curItem = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
    const quantity = CartUtils.getQuantityFromCartItem(cartItem);
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
    .map(ProductUtils.createStockMessage)
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
  const priceHTML = ProductUtils.getPriceHTML(product);

  // 이름에 아이콘 추가
  const icon = ProductUtils.getSaleIcon(product);
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
      product: ProductUtils.findProductById(cartItem.id, productStore.getState().products),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      updateCartItemPrice(cartItem, product);
    });

  // 전체 계산 다시 실행
  handleCalculateCartStuff();
}

//main 실행
main();
