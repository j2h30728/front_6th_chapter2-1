// 🏪 상품 도메인 옵저버
import createObserver from '../../utils/createObserver.js';

/**
 * 상품 상태 변화를 감지하고 관련 UI를 업데이트하는 옵저버
 * @param {Object} productStore - 상품 store
 * @param {Object} handlers - UI 업데이트 핸들러들
 * @returns {Object} 구독 가능한 옵저버
 */
export const createProductObserver = (productStore, handlers) => {
  return createObserver(productStore, () => {
    // 상품 상태 변경 시 UI 업데이트
    handlers.onUpdateSelectOptions();
    handlers.doUpdatePricesInCart();
    handlers.handleCalculateCartStuff();
  });
};
