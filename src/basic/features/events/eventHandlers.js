// 🏪 이벤트 핸들러 모듈
import { getElement } from '../../utils/domUtils.js';
import { CartUtils } from '../cart/cartUtils.js';
import { ProductUtils } from '../product/productUtils.js';
import uiRenderer from '../ui/uiRenderer.js';

// 🛒 장바구니 이벤트 핸들러들
export const cartEventHandlers = {
  handleAddToCart: (handleCalculateCartStuff, cartStore, productStore) => {
    const sel = getElement('product-select');
    const selItem = sel.value;
    const hasItem = productStore.getState().products.some((product) => product.id === selItem);

    if (!selItem || !hasItem) {
      return;
    }

    const itemToAdd = ProductUtils.findProductById(selItem, productStore.getState().products);
    if (itemToAdd && itemToAdd.q > 0) {
      const cartContainer = getElement('cart-items');
      const existingItem = getElement(itemToAdd.id);

      if (existingItem) {
        // 기존 아이템 수량 증가
        const currentQty = CartUtils.getQuantityFromCartItem(existingItem);
        const newQty = currentQty + 1;
        if (newQty <= itemToAdd.q + currentQty) {
          CartUtils.setQuantityToCartItem(existingItem, newQty);
          productStore.dispatch({
            type: 'DECREASE_STOCK',
            payload: { productId: itemToAdd.id, quantity: 1 },
          });
        } else {
          alert('재고가 부족합니다.');
          return;
        }
      } else {
        // 새 아이템 추가
        cartContainer.insertAdjacentHTML('beforeend', CartUtils.createCartItemHTML(itemToAdd));
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemToAdd.id, quantity: 1 },
        });
      }

      handleCalculateCartStuff();
      cartStore.dispatch({ type: 'SET_LAST_SELECTED', payload: itemToAdd.id });
    }
  },

  handleCartItemClick: (event, target, handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore) => {
    const productState = productStore.getState();

    if (target.classList.contains('quantity-change')) {
      const cartItem = target.closest('.cart-item');
      if (!cartItem) return;

      const itemId = cartItem.id;
      const changeType = target.dataset.change;
      const prod = ProductUtils.findProductById(itemId, productState.products);

      if (!prod) return;

      // 수량 변경
      const qtyChange = parseInt(changeType);
      const currentQty = CartUtils.getQuantityFromCartItem(cartItem);
      const newQty = currentQty + qtyChange;

      if (newQty > 0 && newQty <= prod.q + currentQty) {
        CartUtils.setQuantityToCartItem(cartItem, newQty);
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: itemId, quantity: qtyChange },
        });
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      } else if (newQty <= 0) {
        productStore.dispatch({
          type: 'INCREASE_STOCK',
          payload: { productId: itemId, quantity: currentQty },
        });
        cartItem.remove();
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (target.classList.contains('remove-item')) {
      const cartItem = target.closest('.cart-item');
      if (!cartItem) return;

      const itemId = cartItem.id;
      const currentQty = CartUtils.getQuantityFromCartItem(cartItem);

      productStore.dispatch({
        type: 'INCREASE_STOCK',
        payload: { productId: itemId, quantity: currentQty },
      });
      cartItem.remove();
      handleCalculateCartStuff();
      onUpdateSelectOptions();
    }
  },

  handleCartItemHover: (event, target) => {
    target.style.transform = 'scale(1.02)';
    target.style.transition = 'transform 0.2s ease';
  },

  handleCartItemLeave: (event, target) => {
    target.style.transform = 'scale(1)';
  },
};

// 📖 매뉴얼 이벤트 핸들러들
export const manualEventHandlers = {
  handleManualToggle: (uiStore) => {
    uiStore.dispatch({ type: 'TOGGLE_MANUAL_OVERLAY' });
    const isVisible = uiStore.getState().isManualOverlayVisible;
    uiRenderer.renderManualOverlay(isVisible);
  },

  handleManualOverlayClick: (event, uiStore) => {
    if (event.target.id === 'manual-overlay') {
      uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
      uiRenderer.renderManualOverlay(false);
    }
  },

  handleManualClose: (uiStore) => {
    uiStore.dispatch({ type: 'SET_MANUAL_OVERLAY_VISIBLE', payload: false });
    uiRenderer.renderManualOverlay(false);
  },
};

// 🎯 통합 이벤트 핸들러들
export const eventHandlers = {
  handleAddToCart: (handleCalculateCartStuff, cartStore, productStore) =>
    cartEventHandlers.handleAddToCart(handleCalculateCartStuff, cartStore, productStore),

  handleCartItemClick: (event, target, handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore) =>
    cartEventHandlers.handleCartItemClick(
      event,
      target,
      handleCalculateCartStuff,
      onUpdateSelectOptions,
      cartStore,
      productStore
    ),

  handleCartItemHover: (event, target) => cartEventHandlers.handleCartItemHover(event, target),

  handleCartItemLeave: (event, target) => cartEventHandlers.handleCartItemLeave(event, target),

  handleManualToggle: (uiStore) => manualEventHandlers.handleManualToggle(uiStore),

  handleManualOverlayClick: (event, uiStore) => manualEventHandlers.handleManualOverlayClick(event, uiStore),

  handleManualClose: (uiStore) => manualEventHandlers.handleManualClose(uiStore),
};
