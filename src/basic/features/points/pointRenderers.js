// 🎯 포인트 렌더링 로직 모듈
import { calculateTotalPoints, getCartState, getCurrentTuesdayStatus } from '../calculations/cartCalculations.js';
import { renderPointsDisplay } from '../ui/uiUpdaters.js';
import { pointService } from './index.js';

// 🎨 UI 관련 상수
const UI_STYLES = {
  HIDDEN: 'none',
  VISIBLE: 'block',
};

/**
 * 보너스 포인트 렌더링
 * @param {Function} getElement - DOM 요소 가져오기 함수
 * @param {Object} cartStore - 장바구니 스토어
 * @param {Object} productStore - 상품 스토어
 */
export const doRenderBonusPoints = (getElement, cartStore, productStore) => {
  const pointsElement = getElement('loyalty-points');
  if (!pointsElement) return;

  const cartDisp = getElement('cart-items');
  if (!cartDisp || cartDisp.children.length === 0) {
    pointsElement.style.display = UI_STYLES.HIDDEN;
    return;
  }

  const { cartItems, totalAmount, totalItems } = getCartState(getElement, cartStore);
  const isTuesday = getCurrentTuesdayStatus();

  const finalPoints = calculateTotalPoints(totalAmount, cartItems, totalItems, isTuesday, productStore);
  const pointsDetail = pointService.createPointsDetail(totalAmount, cartItems, totalItems, isTuesday, productStore);

  renderPointsDisplay(pointsElement, finalPoints, pointsDetail);
};
