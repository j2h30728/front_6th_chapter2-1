import { cartActions } from '../cart/cartStore.js';
import { CartUtils } from '../cart/cartUtils.js';
import { discountService } from '../discount/discountService.js';
import { ProductUtils } from '../product/productUtils.js';
import { uiActions } from '../ui/uiStore.js';

/**
 * 장바구니 표시 업데이트
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {number} finalTotal - 최종 총액
 * @param {number} totalItems - 총 아이템 수
 * @param {Object} cartStore - 장바구니 스토어
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateCartDisplay = (cartItems, finalTotal, totalItems, cartStore, uiRenderer) => {
  uiRenderer.renderCartDisplay(totalItems, finalTotal);
  cartStore.dispatch(cartActions.setTotalAmount(finalTotal));
  cartStore.dispatch(cartActions.setItemCount(totalItems));
};

/**
 * 화요일 특별 할인 표시 업데이트
 * @param {boolean} isTuesday - 화요일 여부
 * @param {number} finalTotal - 최종 총액
 * @param {Object} uiRenderer - UI 렌더러
 * @param {Object} uiStore - UI 스토어
 */
export const updateTuesdaySpecialDisplay = (isTuesday, finalTotal, uiRenderer, uiStore) => {
  uiRenderer.renderTuesdaySpecial(isTuesday, finalTotal);
  uiStore.dispatch(uiActions.toggleTuesdaySpecial(isTuesday && finalTotal > 0));
};

/**
 * 주문 요약 상세 업데이트
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {number} subtotal - 소계
 * @param {number} finalTotal - 최종 총액
 * @param {number} bulkDiscount - 대량 할인
 * @param {Array} itemDiscounts - 개별 할인들
 * @param {boolean} isTuesday - 화요일 여부
 * @param {Object} productStore - 상품 스토어
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateSummaryDetails = (
  cartItems,
  subtotal,
  finalTotal,
  bulkDiscount,
  itemDiscounts,
  isTuesday,
  productStore,
  uiRenderer
) => {
  if (subtotal <= 0) {
    uiRenderer.renderSummaryDetails([]);
    return;
  }

  const summaryItems = cartItems.map((cartItem) => {
    const currentProduct = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
    const quantity = CartUtils.getQuantityFromCartItem(cartItem);
    return createSummaryItemHTML(currentProduct, quantity);
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

/**
 * 포인트 표시 업데이트
 * @param {number} totalPoints - 총 포인트
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updatePointsDisplay = (totalPoints, uiRenderer) => {
  uiRenderer.renderPointsDisplay(totalPoints);
};

/**
 * 할인 정보 업데이트
 * @param {number} subtotal - 소계
 * @param {number} finalTotal - 최종 총액
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateDiscountInfo = (subtotal, finalTotal, uiRenderer) => {
  const totalDiscountRate = (subtotal - finalTotal) / subtotal;
  const savedAmount = subtotal - finalTotal;
  uiRenderer.renderDiscountInfo(totalDiscountRate, savedAmount);
};

/**
 * 재고 메시지 업데이트
 * @param {Object} productStore - 상품 스토어
 * @param {Object} uiRenderer - UI 렌더러
 * @param {Object} STOCK_POLICIES - 재고 정책 상수
 */
export const updateStockMessages = (productStore, uiRenderer, STOCK_POLICIES) => {
  const stockMessages = productStore
    .getState()
    .products.filter((item) => item.stockQuantity < STOCK_POLICIES.LOW_STOCK_THRESHOLD)
    .map(ProductUtils.createStockMessage)
    .filter(Boolean);

  uiRenderer.renderStockMessages(stockMessages);
};

/**
 * 장바구니 아이템 스타일 업데이트
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateCartItemStyles = (cartItems, uiRenderer) => {
  uiRenderer.renderCartItemStyles(cartItems);
};

/**
 * 포인트 표시 렌더링
 * @param {HTMLElement} pointsElement - 포인트 태그 요소
 * @param {number} finalPoints - 최종 포인트
 * @param {Array} pointsDetail - 포인트 상세 정보
 */
export const renderPointsDisplay = (pointsElement, finalPoints, pointsDetail) => {
  if (!pointsElement) return;

  if (finalPoints > 0) {
    pointsElement.innerHTML = createBonusPointsHTML(finalPoints, pointsDetail);
    pointsElement.style.display = 'block';
  } else {
    pointsElement.style.display = 'none';
  }
};

/**
 * 보너스 포인트 HTML 생성
 * @param {number} finalPoints - 최종 포인트
 * @param {Array} pointsDetail - 포인트 상세 정보
 * @returns {string} HTML 문자열
 */
export const createBonusPointsHTML = (finalPoints, pointsDetail) => {
  const detailHTML =
    pointsDetail.length > 0 ? `<div class="text-xs text-gray-400">${pointsDetail.join(', ')}</div>` : '';
  return `
    <div class="bg-blue-500/20 rounded-lg p-3">
      <div class="text-sm font-medium text-blue-400">적립 포인트: ${finalPoints}p</div>
      ${detailHTML}
    </div>
  `;
};

/**
 * 모든 UI 업데이트
 * @param {Function} getElement - DOM 요소 가져오기 함수
 * @param {Object} productStore - 상품 스토어
 * @param {Object} cartStore - 장바구니 스토어
 * @param {Object} uiStore - UI 스토어
 * @param {Object} uiRenderer - UI 렌더러
 * @param {Object} STOCK_POLICIES - 재고 정책 상수
 */
export const updateAllUI = (getElement, productStore, cartStore, uiStore, uiRenderer, STOCK_POLICIES) => {
  const cartData = calculateCartData(getElement, productStore);
  const { cartItems, totalAmount, totalItems } = cartData;

  // 할인 계산
  const itemDiscounts = discountService.createDiscountInfo(cartItems, productStore);
  const discountResult = discountService.applyDiscounts(totalAmount, itemDiscounts, totalItems);
  const { finalTotal, isTuesday, bulkDiscount } = discountResult;

  updateCartDisplay(cartItems, finalTotal, totalItems, cartStore, uiRenderer);
  updateTuesdaySpecialDisplay(isTuesday, finalTotal, uiRenderer, uiStore);
  updateSummaryDetails(
    cartItems,
    totalAmount,
    finalTotal,
    bulkDiscount,
    itemDiscounts,
    isTuesday,
    productStore,
    uiRenderer
  );
  updatePointsDisplay(calculateTotalPoints(finalTotal, cartItems, totalItems, isTuesday, productStore), uiRenderer);
  updateDiscountInfo(totalAmount, finalTotal, uiRenderer);
  updateStockMessages(productStore, uiRenderer, STOCK_POLICIES);
  updateCartItemStyles(cartItems, uiRenderer);
};

// HTML 생성 함수들
const createSummaryItemHTML = (product, quantity) => /*html*/ `
  <div class="flex justify-between text-sm">
    <span>${product.name} × ${quantity}</span>
    <span>₩${(product.price * quantity).toLocaleString()}</span>
  </div>
`;

const createBulkDiscountHTML = () => /*html*/ `
  <div class="flex justify-between text-sm text-red-500">
    <span>대량 할인 (25%)</span>
    <span>-₩${Math.round(1000000 * 0.25).toLocaleString()}</span>
  </div>
`;

const createItemDiscountHTML = (discount) => /*html*/ `
  <div class="flex justify-between text-sm text-blue-500">
    <span>${discount.name} 할인</span>
    <span>-₩${Math.round(discount.discount).toLocaleString()}</span>
  </div>
`;

const createTuesdayDiscountHTML = () => /*html*/ `
  <div class="flex justify-between text-sm text-green-500">
    <span>화요일 할인 (10%)</span>
    <span>-₩${Math.round(1000000 * 0.1).toLocaleString()}</span>
  </div>
`;

const createSummarySubtotalHTML = (subtotal) => /*html*/ `
  <div class="flex justify-between font-medium border-t pt-2">
    <span>소계</span>
    <span>₩${subtotal.toLocaleString()}</span>
  </div>
`;

const createShippingHTML = () => /*html*/ `
  <div class="flex justify-between text-sm text-gray-500">
    <span>배송비</span>
    <span>무료</span>
  </div>
`;

// 유틸리티 함수들
const calculateCartData = (getElement, productStore) => {
  const cartDisp = getElement('cart-items');
  if (!cartDisp) {
    return {
      cartItems: [],
      totalAmount: 0,
      totalItems: 0,
    };
  }

  const cartItems = Array.from(cartDisp.children);
  let totalAmount = 0;
  let totalItems = 0;

  cartItems.forEach((cartItem) => {
    const productId = cartItem.id;
    const quantity = CartUtils.getQuantityFromCartItem(cartItem);
    const product = ProductUtils.findProductById(productId, productStore.getState().products);

    if (product) {
      totalAmount += product.price * quantity;
      totalItems += quantity;
    }
  });

  return {
    cartItems,
    totalAmount,
    totalItems,
  };
};

const calculateTotalPoints = (finalTotal, cartItems, totalItems, isTuesday) => {
  return Math.floor(finalTotal * 0.001) * (isTuesday ? 2 : 1);
};
