// 🏪 할인 계산 서비스
import { DISCOUNT_POLICIES, UI_CONSTANTS } from '../../constants/index.js';
import { CartUtils } from '../cart/index.js';
import { ProductUtils } from '../product/index.js';

/**
 * 할인 계산 서비스
 */
export const discountService = {
  /**
   * 개별 상품 할인 계산
   * @param {string} productId - 상품 ID
   * @param {number} quantity - 수량
   * @returns {number} 할인율
   */
  calculateIndividualDiscount: (productId, quantity) => {
    if (quantity < UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD) return 0;
    return DISCOUNT_POLICIES.INDIVIDUAL_DISCOUNTS[productId] || 0;
  },

  /**
   * 대량 구매 할인 계산
   * @param {number} totalItems - 총 아이템 수
   * @returns {number} 할인율
   */
  calculateBulkDiscount: (totalItems) => {
    return totalItems >= DISCOUNT_POLICIES.BULK_DISCOUNT.THRESHOLD ? DISCOUNT_POLICIES.BULK_DISCOUNT.RATE : 0;
  },

  /**
   * 화요일 할인 계산
   * @param {number} subtotal - 소계
   * @returns {number} 할인율
   */
  calculateTuesdayDiscount: (subtotal) => {
    const today = new Date();
    const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
    return isTuesday && subtotal > 0 ? DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.RATE : 0;
  },

  /**
   * 최종 할인 적용
   * @param {number} subtotal - 소계
   * @param {Array} itemDiscounts - 아이템 할인 정보
   * @param {number} totalItems - 총 아이템 수
   * @returns {Object} 최종 할인 결과
   */
  applyDiscounts: (subtotal, itemDiscounts, totalItems) => {
    const bulkDiscount = discountService.calculateBulkDiscount(totalItems);
    const tuesdayDiscount = discountService.calculateTuesdayDiscount(subtotal);

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

  /**
   * 할인 정보 생성
   * @param {HTMLCollection} cartItems - 장바구니 아이템들
   * @param {Object} productStore - 상품 스토어
   * @returns {Array} 할인 정보 배열
   */
  createDiscountInfo: (cartItems, productStore) => {
    return Array.from(cartItems)
      .map((cartItem) => {
        const curItem = ProductUtils.findProductById(cartItem.id, productStore.getState().products);
        const quantity = CartUtils.getQuantityFromCartItem(cartItem);
        const discount = discountService.calculateIndividualDiscount(curItem.id, quantity);

        return discount > 0 ? { name: curItem.name, discount: discount * 100 } : null;
      })
      .filter(Boolean);
  },
};
