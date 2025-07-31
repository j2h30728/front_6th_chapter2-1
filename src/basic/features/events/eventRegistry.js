import { getElement } from '../../utils/domUtils.js';
import { eventHandlers } from './eventHandlers.js';
import { eventSystem } from './eventSystem.js';

export const registerEventListeners = (
  handleCalculateCartStuff,
  onUpdateSelectOptions,
  cartStore,
  productStore,
  uiStore
) => {
  const appContainer = getElement('app');

  // 이벤트 위임 핸들러 등록
  eventSystem.registerHandler('click', '#manual-toggle', () => eventHandlers.handleManualToggle(uiStore));
  eventSystem.registerHandler('click', '#manual-overlay', (event) =>
    eventHandlers.handleManualOverlayClick(event, uiStore)
  );
  eventSystem.registerHandler('click', '#manual-close', () => eventHandlers.handleManualClose(uiStore));
  eventSystem.registerHandler('click', '#add-to-cart', () =>
    eventHandlers.handleAddToCart(handleCalculateCartStuff, cartStore, productStore)
  );
  eventSystem.registerHandler('click', '.quantity-change', (event, target) =>
    eventHandlers.handleCartItemClick(
      event,
      target,
      handleCalculateCartStuff,
      onUpdateSelectOptions,
      cartStore,
      productStore
    )
  );
  eventSystem.registerHandler('click', '.remove-item', (event, target) =>
    eventHandlers.handleCartItemClick(
      event,
      target,
      handleCalculateCartStuff,
      onUpdateSelectOptions,
      cartStore,
      productStore
    )
  );

  // 동적 이벤트 타입 등록 예제
  eventSystem.registerEventType('mouseenter');
  eventSystem.registerEventType('mouseleave');

  // 동적으로 등록된 이벤트 타입에 대한 핸들러 등록
  eventSystem.registerHandler('mouseenter', '.cart-item', eventHandlers.handleCartItemHover);
  eventSystem.registerHandler('mouseleave', '.cart-item', eventHandlers.handleCartItemLeave);

  // 이벤트 위임 리스너 등록
  eventSystem.attachEventListeners(appContainer);
};
