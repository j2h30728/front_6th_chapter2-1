import { getElement } from '../../utils/domUtils.js';
import { CartUtils } from '../cart/cartUtils.js';
import { ProductUtils } from '../product/productUtils.js';
import uiRenderer from '../ui/uiRenderer.js';

export const cartEventHandlers = {
  handleAddToCart: (handleCalculateCartStuff, cartStore, productStore) => {
    const productSelectElement = getElement('product-select');
    const selectedProductId = productSelectElement.value;
    const hasProduct = productStore.getState().products.some((product) => product.id === selectedProductId);

    if (!selectedProductId || !hasProduct) {
      return;
    }

    const productToAdd = ProductUtils.findProductById(selectedProductId, productStore.getState().products);
    if (!productToAdd || productToAdd.stockQuantity <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    const cartItemsContainer = getElement('cart-items');
    const existingCartItem = cartItemsContainer.querySelector(`#${productToAdd.id}`);

    if (existingCartItem) {
      // 기존 아이템 수량 증가
      const currentQuantity = CartUtils.getQuantityFromCartItem(existingCartItem);
      const newQuantity = currentQuantity + 1;

      if (newQuantity <= productToAdd.stockQuantity + currentQuantity) {
        CartUtils.setQuantityToCartItem(existingCartItem, newQuantity);
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId: productToAdd.id, quantity: 1 },
        });
      } else {
        alert('재고가 부족합니다.');
        return;
      }
    } else {
      // 새 아이템 추가
      cartItemsContainer.insertAdjacentHTML('beforeend', CartUtils.createCartItemHTML(productToAdd));
      productStore.dispatch({
        type: 'DECREASE_STOCK',
        payload: { productId: productToAdd.id, quantity: 1 },
      });
    }

    handleCalculateCartStuff();
    cartStore.dispatch({ type: 'SET_LAST_SELECTED_PRODUCT_ID', payload: productToAdd.id });
  },

  handleCartItemClick: (event, target, handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore) => {
    const productState = productStore.getState();

    if (target.classList.contains('quantity-change')) {
      const cartItemElement = target.closest('.cart-item');
      if (!cartItemElement) return;

      const productId = cartItemElement.id;
      const quantityChange = parseInt(target.dataset.change);
      const product = ProductUtils.findProductById(productId, productState.products);

      if (!product) return;

      // 수량 변경
      const currentQuantity = CartUtils.getQuantityFromCartItem(cartItemElement);
      const newQuantity = currentQuantity + quantityChange;

      if (newQuantity > 0 && newQuantity <= product.stockQuantity + currentQuantity) {
        CartUtils.setQuantityToCartItem(cartItemElement, newQuantity);
        productStore.dispatch({
          type: 'DECREASE_STOCK',
          payload: { productId, quantity: quantityChange },
        });
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      } else if (newQuantity <= 0) {
        productStore.dispatch({
          type: 'INCREASE_STOCK',
          payload: { productId, quantity: currentQuantity },
        });
        cartItemElement.remove();
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (target.classList.contains('remove-item')) {
      const cartItemElement = target.closest('.cart-item');
      if (!cartItemElement) return;

      const productId = cartItemElement.id;
      const currentQuantity = CartUtils.getQuantityFromCartItem(cartItemElement);

      productStore.dispatch({
        type: 'INCREASE_STOCK',
        payload: { productId, quantity: currentQuantity },
      });
      cartItemElement.remove();
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
