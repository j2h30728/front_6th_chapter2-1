// 🛒 장바구니 도메인 옵저버
import createObserver from '../../utils/createObserver.js';
import { formatPrice } from '../../utils/dataUtils.js';
import { getElement, setTextContent } from '../../utils/domUtils.js';

/**
 * 장바구니 상태 변화를 감지하고 UI를 업데이트하는 옵저버
 * @param {Object} cartStore - 장바구니 store
 * @returns {Object} 구독 가능한 옵저버
 */
export const createCartObserver = (cartStore) => {
  return createObserver(cartStore, (state) => {
    // 장바구니 상태 변경 시 UI 업데이트
    // 장바구니 아이템 수 업데이트
    setTextContent('item-count', `🛍️ ${state.itemCount} items in cart`);

    // 총액 업데이트
    const totalDiv = document.getElementById('total-amount');
    if (totalDiv) {
      totalDiv.textContent = formatPrice(state.totalAmount);
    }

    // 포인트 업데이트
    const points = Math.floor(state.totalAmount / 1000);
    const pointsDisplay = points > 0 ? `적립 포인트: ${points}p` : '적립 포인트: 0p';
    const loyaltyPointsDiv = getElement('loyalty-points');
    if (loyaltyPointsDiv) {
      loyaltyPointsDiv.textContent = pointsDisplay;
      loyaltyPointsDiv.style.display = 'block';
    }
  });
};
