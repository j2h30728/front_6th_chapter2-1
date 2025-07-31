import {
  createBulkDiscountHTML,
  createItemDiscountHTML,
  createShippingHTML,
  createSummaryItemHTML,
  createSummarySubtotalHTML,
  createTuesdayDiscountHTML,
} from '../../components/index.js';
import { CartUtils } from '../cart/cartUtils.js';
import { ProductUtils } from '../product/productUtils.js';

const UI_STYLES = {
  HIDDEN: 'none',
  VISIBLE: 'block',
};

/**
 * 장바구니 표시 업데이트
 * @param {number} totalItems - 총 아이템 수
 * @param {number} finalTotal - 최종 총액
 * @param {Object} cartStore - 장바구니 스토어
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateCartDisplay = (totalItems, finalTotal, cartStore, uiRenderer) => {
  cartStore.dispatch({ type: 'SET_TOTAL_AMOUNT', payload: finalTotal });
  cartStore.dispatch({ type: 'SET_ITEM_COUNT', payload: totalItems });
  uiRenderer.renderCartDisplay(totalItems, finalTotal);
};

/**
 * 화요일 특별 할인 표시 업데이트
 * @param {boolean} isTuesday - 화요일 여부
 * @param {number} finalTotal - 최종 총액
 * @param {Object} uiStore - UI 스토어
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateTuesdaySpecialDisplay = (isTuesday, finalTotal, uiStore, uiRenderer) => {
  uiStore.dispatch({ type: 'TOGGLE_TUESDAY_SPECIAL', payload: isTuesday && finalTotal > 0 });
  uiRenderer.renderTuesdaySpecial(isTuesday, finalTotal);
};

/**
 * 요약 상세 정보 업데이트
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {number} subtotal - 소계
 * @param {Array} itemDiscounts - 아이템 할인 정보
 * @param {number} bulkDiscount - 대량 할인
 * @param {boolean} isTuesday - 화요일 여부
 * @param {number} finalTotal - 최종 총액
 * @param {Object} productStore - 상품 스토어
 * @param {Object} uiRenderer - UI 렌더러
 */
export const updateSummaryDetails = (
  cartItems,
  subtotal,
  itemDiscounts,
  bulkDiscount,
  isTuesday,
  finalTotal,
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
  } else {
    pointsElement.textContent = '적립 포인트: 0p';
  }
  pointsElement.style.display = UI_STYLES.VISIBLE;
};

/**
 * 보너스 포인트 HTML 생성
 * @param {number} points - 포인트
 * @param {Array} details - 상세 정보
 * @returns {string} HTML 문자열
 */
export const createBonusPointsHTML = (points, details) => /*html*/ `
  <div>적립 포인트: <span class="font-bold">${points}p</span></div>
  <div class="text-2xs opacity-70 mt-1">${details.join(', ')}</div>
`;

/**
 * 모든 UI 업데이트 실행
 * @param {Object} cartData - 장바구니 데이터
 * @param {Object} stores - 스토어들
 * @param {Object} uiRenderer - UI 렌더러
 * @param {Object} STOCK_POLICIES - 재고 정책 상수
 */
export const updateAllUI = (cartData, stores, uiRenderer, STOCK_POLICIES) => {
  const { totalItems, finalTotal, isTuesday, subtotal, itemDiscounts, bulkDiscount, totalPoints, cartItems } = cartData;
  const { cartStore, uiStore, productStore } = stores;

  updateCartDisplay(totalItems, finalTotal, cartStore, uiRenderer);
  updateTuesdaySpecialDisplay(isTuesday, finalTotal, uiStore, uiRenderer);
  updateSummaryDetails(
    cartItems,
    subtotal,
    itemDiscounts,
    bulkDiscount,
    isTuesday,
    finalTotal,
    productStore,
    uiRenderer
  );
  updatePointsDisplay(totalPoints, uiRenderer);
  updateDiscountInfo(subtotal, finalTotal, uiRenderer);
  updateStockMessages(productStore, uiRenderer, STOCK_POLICIES);
  updateCartItemStyles(cartItems, uiRenderer);
};
