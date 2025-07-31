// 🧩 컴포넌트 imports
import {
  createBulkDiscountHTML,
  createCartItems,
  createHeader,
  createItemDiscountHTML,
  createManualOverlay,
  createManualToggleButton,
  createProductSelector,
  createRightColumn,
  createShippingHTML,
  createSummaryItemHTML,
  createSummarySubtotalHTML,
  createTuesdayDiscountHTML,
} from './components/index.js';
// 🏪 상수들 import
import { STOCK_POLICIES, UI_CONSTANTS } from './constants/index.js';
// 🏪 기능 모듈 imports
import {
  cartStore,
  CartUtils,
  createInitialProductState,
  createProductStore,
  discountService,
  optionService,
  pointService,
  ProductUtils,
  registerEventListeners,
  saleService,
  setupObservers,
  uiRenderer,
  uiStore,
} from './features/index.js';
// 🛠️ 유틸리티 imports
import { getElement } from './utils/index.js';

// 🏪 Product Store 초기화
const productStore = createProductStore({
  products: createInitialProductState(),
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
  setupObservers(cartStore, productStore, uiStore, uiRenderer);

  // 이벤트 위임 리스너 등록
  registerEventListeners(handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore, uiStore);

  onUpdateSelectOptions();
  handleCalculateCartStuff();

  // 🏪 세일 서비스 시작
  saleService.startAllSales(cartStore, productStore, onUpdateSelectOptions, doUpdatePricesInCart);
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

  const itemDiscounts = discountService.createDiscountInfo(cartItems, productStore);
  return { ...cartData, itemDiscounts };
};

const calculateFinalTotal = (subtotal, itemDiscounts, totalItems) => {
  return discountService.applyDiscounts(subtotal, itemDiscounts, totalItems);
};

const calculateTotalPoints = (finalTotal, cartItems, totalItems, isTuesday) => {
  return pointService.calculateTotalPoints(finalTotal, cartItems, totalItems, isTuesday, productStore);
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

  const cartItems = Array.from(cartDisp.children);
  const totalAmount = cartStore.getState().totalAmt;
  const totalItems = cartStore.getState().itemCnt;
  const isTuesday = new Date().getDay() === 2;

  const finalPoints = calculateTotalPoints(totalAmount, cartItems, totalItems, isTuesday);
  const pointsDetail = pointService.createPointsDetail(totalAmount, cartItems, totalItems, isTuesday, productStore);

  if (finalPoints > 0) {
    ptsTag.innerHTML = createBonusPointsHTML(finalPoints, pointsDetail);
    ptsTag.style.display = 'block';
  } else {
    ptsTag.textContent = '적립 포인트: 0p';
    ptsTag.style.display = 'block';
  }
};

// 재고 메시지 생성 헬퍼 함수 (이미 위에 정의됨)

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

// 🏪 옵션 업데이트 함수
const onUpdateSelectOptions = () => {
  optionService.updateSelectOptions(productStore, ProductUtils, UI_CONSTANTS);
};

//main 실행
main();
