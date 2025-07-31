import { CartUtils } from '../cart/cartUtils.js';
import { discountService } from '../discount/index.js';
import { pointService } from '../points/index.js';
import { ProductUtils } from '../product/productUtils.js';

const DAYS_OF_WEEK = {
  TUESDAY: 2,
};

/**
 * 장바구니 아이템들의 기본 정보 계산
 * @param {HTMLCollection} cartItems - 장바구니 아이템들
 * @param {Object} productStore - 상품 스토어
 * @returns {Object} 계산된 장바구니 데이터
 */
export const calculateCartItems = (cartItems, productStore) => {
  const cartData = Array.from(cartItems).reduce(
    (acc, cartItem) => {
      const currentProduct = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
      const quantity = CartUtils.getQuantityFromCartItem(cartItem);
      const itemTotal = currentProduct.price * quantity;

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

/**
 * 최종 총액 계산
 * @param {number} subtotal - 소계
 * @param {Array} itemDiscounts - 아이템 할인 정보
 * @param {number} totalItems - 총 아이템 수
 * @returns {Object} 최종 계산 결과
 */
export const calculateFinalTotal = (subtotal, itemDiscounts, totalItems) => {
  return discountService.applyDiscounts(subtotal, itemDiscounts, totalItems);
};

/**
 * 포인트 계산
 * @param {number} finalTotal - 최종 총액
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {number} totalItems - 총 아이템 수
 * @param {boolean} isTuesday - 화요일 여부
 * @param {Object} productStore - 상품 스토어
 * @returns {number} 계산된 포인트
 */
export const calculateTotalPoints = (finalTotal, cartItems, totalItems, isTuesday, productStore) => {
  return pointService.calculateTotalPoints(finalTotal, cartItems, totalItems, isTuesday, productStore);
};

/**
 * 현재 화요일 상태 확인
 * @returns {boolean} 화요일 여부
 */
export const getCurrentTuesdayStatus = () => {
  return new Date().getDay() === DAYS_OF_WEEK.TUESDAY;
};

/**
 * 장바구니 상태 정보 가져오기
 * @param {Function} getElement - DOM 요소 가져오기 함수
 * @param {Object} cartStore - 장바구니 스토어
 * @returns {Object} 장바구니 상태
 */
export const getCartState = (getElement, cartStore) => {
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
    totalAmount: cartStore.getState().totalAmount,
    totalItems: cartStore.getState().itemCount,
  };
};

/**
 * 장바구니 데이터 전체 계산
 * @param {Function} getElement - DOM 요소 가져오기 함수
 * @param {Object} productStore - 상품 스토어
 * @returns {Object} 계산된 장바구니 데이터
 */
export const calculateCartData = (getElement, productStore) => {
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
  const { subtotal, totalItems, itemDiscounts } = calculateCartItems(cartItems, productStore);
  const { finalTotal, isTuesday, bulkDiscount } = calculateFinalTotal(subtotal, itemDiscounts, totalItems);
  const cartItemsArray = Array.from(cartItems);
  const totalPoints = calculateTotalPoints(finalTotal, cartItemsArray, totalItems, isTuesday, productStore);

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
