// 🎨 UI 도메인 옵저버
import createObserver from '../../utils/createObserver.js';
import { getElement } from '../../utils/domUtils.js';

/**
 * UI 상태 변화를 감지하고 DOM을 업데이트하는 옵저버
 * @param {Object} uiStore - UI store
 * @param {Object} uiRenderer - UI 렌더링 모듈
 * @returns {Object} 구독 가능한 옵저버
 */
export const createUIObserver = (uiStore, uiRenderer) => {
  return createObserver(uiStore, (state) => {
    // UI 상태 변경 시 DOM 업데이트
    uiRenderer.renderManualOverlay(state.isManualOverlayVisible);

    // 화요일 할인 표시
    const tuesdaySpecial = getElement('tuesday-special');
    if (tuesdaySpecial) {
      if (state.isTuesdaySpecialVisible) {
        tuesdaySpecial.classList.remove('hidden');
      } else {
        tuesdaySpecial.classList.add('hidden');
      }
    }

    // 재고 메시지 표시
    const stockInfo = getElement('stock-status');
    if (stockInfo) {
      stockInfo.textContent = state.stockMessage;
    }
  });
};
