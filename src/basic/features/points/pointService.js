// 🏪 포인트 계산 서비스
import { POINT_POLICIES, PRODUCT_IDS } from '../../constants/index.js';
import { ProductUtils } from '../product/index.js';

/**
 * 포인트 계산 서비스
 */
export const pointService = {
  /**
   * 기본 포인트 계산
   * @param {number} finalTotal - 최종 금액
   * @returns {number} 기본 포인트
   */
  calculateBasePoints: (finalTotal) => {
    return Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);
  },

  /**
   * 화요일 보너스 계산
   * @param {number} basePoints - 기본 포인트
   * @param {boolean} isTuesday - 화요일 여부
   * @returns {number} 화요일 보너스 포인트
   */
  calculateTuesdayBonus: (basePoints, isTuesday) => {
    return isTuesday ? basePoints * POINT_POLICIES.TUESDAY_MULTIPLIER : basePoints;
  },

  /**
   * 세트 보너스 계산
   * @param {Array} cartItems - 장바구니 아이템들
   * @param {Object} productStore - 상품 스토어
   * @returns {number} 세트 보너스 포인트
   */
  calculateSetBonus: (cartItems, productStore) => {
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

  /**
   * 수량 보너스 계산
   * @param {number} totalItems - 총 아이템 수
   * @returns {number} 수량 보너스 포인트
   */
  calculateQuantityBonus: (totalItems) => {
    const quantityThresholds = Object.keys(POINT_POLICIES.QUANTITY_BONUSES)
      .map(Number)
      .sort((firstThreshold, secondThreshold) => secondThreshold - firstThreshold);

    for (const threshold of quantityThresholds) {
      if (totalItems >= threshold) {
        return POINT_POLICIES.QUANTITY_BONUSES[threshold];
      }
    }
    return 0;
  },

  /**
   * 총 포인트 계산
   * @param {number} finalTotal - 최종 금액
   * @param {Array} cartItems - 장바구니 아이템들
   * @param {number} totalItems - 총 아이템 수
   * @param {boolean} isTuesday - 화요일 여부
   * @param {Object} productStore - 상품 스토어
   * @returns {number} 총 포인트
   */
  calculateTotalPoints: (finalTotal, cartItems, totalItems, isTuesday, productStore) => {
    const basePoints = pointService.calculateBasePoints(finalTotal);
    const tuesdayPoints = pointService.calculateTuesdayBonus(basePoints, isTuesday);
    const setBonus = pointService.calculateSetBonus(cartItems, productStore);
    const quantityBonus = pointService.calculateQuantityBonus(totalItems);

    return tuesdayPoints + setBonus + quantityBonus;
  },

  /**
   * 포인트 상세 내역 생성
   * @param {number} finalTotal - 최종 금액
   * @param {Array} cartItems - 장바구니 아이템들
   * @param {number} totalItems - 총 아이템 수
   * @param {boolean} isTuesday - 화요일 여부
   * @param {Object} productStore - 상품 스토어
   * @returns {Array} 포인트 상세 내역
   */
  createPointsDetail: (finalTotal, cartItems, totalItems, isTuesday, productStore) => {
    const pointsDetail = [];
    const basePoints = pointService.calculateBasePoints(finalTotal);

    if (basePoints > 0) {
      pointsDetail.push('기본: ' + basePoints + 'p');
    }

    if (isTuesday && basePoints > 0) {
      pointsDetail.push('화요일 2배');
    }

    const setBonus = pointService.calculateSetBonus(cartItems, productStore);
    if (setBonus > 0) {
      if (setBonus >= POINT_POLICIES.SET_BONUSES.FULL_SET) {
        pointsDetail.push('풀세트 구매 +100p');
      } else if (setBonus >= POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE) {
        pointsDetail.push('키보드+마우스 세트 +50p');
      }
    }

    const quantityBonus = pointService.calculateQuantityBonus(totalItems);
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
