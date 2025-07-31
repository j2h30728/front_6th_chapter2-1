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
    uiRenderer.renderManualOverlay(state.isManualOverlayVisible);

    const tuesdaySpecial = getElement('tuesday-special');
    if (!tuesdaySpecial) return;

    if (state.isTuesdaySpecialVisible) {
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }

    const stockInfo = getElement('stock-status');
    if (!stockInfo) return;

    stockInfo.textContent = state.stockMessage;
  });
};
