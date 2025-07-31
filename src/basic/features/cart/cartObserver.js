// 🛒 장바구니 도메인 옵저버
import createObserver from '../../utils/createObserver.js';
import { formatPrice } from '../../utils/dataUtils.js';
import { getElement, querySelector, setTextContent } from '../../utils/domUtils.js';

/**
 * 장바구니 상태 변화를 감지하고 UI를 업데이트하는 옵저버
 * @param {Object} cartStore - 장바구니 store
 * @returns {Object} 구독 가능한 옵저버
 */
export const createCartObserver = (cartStore) => {
  return createObserver(cartStore, (state) => {
    // 장바구니 상태 변경 시 UI 업데이트
    setTextContent('item-count', `🛍️ ${state.itemCnt} items in cart`);

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
};
