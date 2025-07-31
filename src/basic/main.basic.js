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

// 📅 날짜 관련 상수
const DAYS_OF_WEEK = {
  TUESDAY: 2,
};

// 🎨 UI 관련 상수
const UI_STYLES = {
  HIDDEN: 'none',
  VISIBLE: 'block',
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

// 📊 계산 로직 함수들
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

  const summaryItems = cartItems.map((cartItem) => {
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

// 🎨 포인트 관련 HTML 헬퍼 함수
const createBonusPointsHTML = (points, details) => /*html*/ `
  <div>적립 포인트: <span class="font-bold">${points}p</span></div>
  <div class="text-2xs opacity-70 mt-1">${details.join(', ')}</div>
`;

// 🎯 포인트 렌더링 관련 함수들
const getCurrentTuesdayStatus = () => {
  return new Date().getDay() === DAYS_OF_WEEK.TUESDAY;
};

const getCartState = () => {
  const cartDisp = getElement('cart-items');
  if (!cartDisp) {
    return {
      cartItems: [],
      totalAmount: 0,
      totalItems: 0,
    };
  }

  const cartItems = Array.from(cartDisp.children);
  return {
    cartItems,
    totalAmount: cartStore.getState().totalAmt,
    totalItems: cartStore.getState().itemCnt,
  };
};

const renderPointsDisplay = (ptsTag, finalPoints, pointsDetail) => {
  if (!ptsTag) return;

  if (finalPoints > 0) {
    ptsTag.innerHTML = createBonusPointsHTML(finalPoints, pointsDetail);
  } else {
    ptsTag.textContent = '적립 포인트: 0p';
  }
  ptsTag.style.display = UI_STYLES.VISIBLE;
};

const doRenderBonusPoints = () => {
  const ptsTag = getElement('loyalty-points');
  if (!ptsTag) return;

  const cartDisp = getElement('cart-items');
  if (!cartDisp || cartDisp.children.length === 0) {
    ptsTag.style.display = UI_STYLES.HIDDEN;
    return;
  }

  const { cartItems, totalAmount, totalItems } = getCartState();
  const isTuesday = getCurrentTuesdayStatus();

  const finalPoints = calculateTotalPoints(totalAmount, cartItems, totalItems, isTuesday);
  const pointsDetail = pointService.createPointsDetail(totalAmount, cartItems, totalItems, isTuesday, productStore);

  renderPointsDisplay(ptsTag, finalPoints, pointsDetail);
};

// 💰 가격 업데이트 헬퍼 함수
const updateCartItemPrice = (cartItem, product) => {
  if (!cartItem || !product) return;

  const priceDiv = cartItem.querySelector('.cart-item-price');
  const nameDiv = cartItem.querySelector('.cart-item-name');

  const priceHTML = ProductUtils.getPriceHTML(product);
  const icon = ProductUtils.getSaleIcon(product);
  const nameText = `${icon}${product.name}`;

  if (priceDiv) {
    priceDiv.innerHTML = priceHTML;
  }
  if (nameDiv) {
    nameDiv.textContent = nameText;
  }
};

// 🏪 옵션 업데이트 함수
const onUpdateSelectOptions = () => {
  optionService.updateSelectOptions(productStore, ProductUtils, UI_CONSTANTS);
};

// 🎯 메인 계산 함수들
const calculateCartData = () => {
  const cartDisp = getElement('cart-items');
  if (!cartDisp) {
    return {
      subtotal: 0,
      totalItems: 0,
      itemDiscounts: [],
      finalTotal: 0,
      isTuesday: false,
      bulkDiscount: 0,
      totalPoints: 0,
      cartItems: [],
    };
  }

  const cartItems = cartDisp.children;
  const { subtotal, totalItems, itemDiscounts } = calculateCartItems(cartItems);
  const { finalTotal, isTuesday, bulkDiscount } = calculateFinalTotal(subtotal, itemDiscounts, totalItems);
  const cartItemsArray = Array.from(cartItems);
  const totalPoints = calculateTotalPoints(finalTotal, cartItemsArray, totalItems, isTuesday);

  return {
    subtotal,
    totalItems,
    itemDiscounts,
    finalTotal,
    isTuesday,
    bulkDiscount,
    totalPoints,
    cartItems: cartItemsArray,
  };
};

const updateAllUI = (cartData) => {
  const { totalItems, finalTotal, isTuesday, subtotal, itemDiscounts, bulkDiscount, totalPoints, cartItems } = cartData;

  updateCartDisplay(totalItems, finalTotal);
  updateTuesdaySpecialDisplay(isTuesday, finalTotal);
  updateSummaryDetails(cartItems, subtotal, itemDiscounts, bulkDiscount, isTuesday, finalTotal);
  updatePointsDisplay(totalPoints);
  updateDiscountInfo(subtotal, finalTotal);
  updateStockMessages();
  updateCartItemStyles(cartItems);
};

const handleCalculateCartStuff = () => {
  const cartData = calculateCartData();
  updateAllUI(cartData);
  doRenderBonusPoints();
};

const doUpdatePricesInCart = () => {
  const cartDisp = getElement('cart-items');
  if (!cartDisp) return;

  const cartItems = Array.from(cartDisp.children);

  cartItems
    .map((cartItem) => ({
      cartItem,
      product: ProductUtils.findProductById(cartItem.id, productStore.getState().products),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      updateCartItemPrice(cartItem, product);
    });

  handleCalculateCartStuff();
};

// 🚀 앱 초기화 함수
function main() {
  cartStore.dispatch({ type: 'RESET_CART' });

  const root = document.getElementById('app');
  root.innerHTML = createApp();

  setupObservers(cartStore, productStore, uiStore, uiRenderer);
  registerEventListeners(handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore, uiStore);

  onUpdateSelectOptions();
  handleCalculateCartStuff();
  saleService.startAllSales(cartStore, productStore, onUpdateSelectOptions, doUpdatePricesInCart);
}

// 앱 실행
main();
