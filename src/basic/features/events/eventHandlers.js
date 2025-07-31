import { getElement } from '../../utils/domUtils.js';
import { cartActions } from '../cart/cartStore.js';
import { CartUtils } from '../cart/cartUtils.js';
import { productActions } from '../product/productStore.js';
import { ProductUtils } from '../product/productUtils.js';
import uiRenderer from '../ui/uiRenderer.js';
import { uiActions } from '../ui/uiStore.js';

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
      handleExistingCartItem(existingCartItem, productToAdd, productStore);
    } else {
      handleNewCartItem(cartItemsContainer, productToAdd, productStore);
    }

    handleCalculateCartStuff();
    cartStore.dispatch(cartActions.setLastSelectedProductId(productToAdd.id));
  },

  handleCartItemClick: (event, target, handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore) => {
    if (target.classList.contains('quantity-change')) {
      handleQuantityChange(event, target, handleCalculateCartStuff, onUpdateSelectOptions, productStore);
    } else if (target.classList.contains('remove-item')) {
      handleRemoveItem(target, handleCalculateCartStuff, onUpdateSelectOptions, productStore);
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

// 기존 장바구니 아이템 처리 함수
const handleExistingCartItem = (existingCartItem, productToAdd, productStore) => {
  const currentQuantity = CartUtils.getQuantityFromCartItem(existingCartItem);
  const newQuantity = currentQuantity + 1;

  if (newQuantity > productToAdd.stockQuantity + currentQuantity) {
    alert('재고가 부족합니다.');
    return;
  }

  CartUtils.setQuantityToCartItem(existingCartItem, newQuantity);
  productStore.dispatch(productActions.decreaseStock(productToAdd.id, 1));
};

// 새 장바구니 아이템 추가 함수
const handleNewCartItem = (cartItemsContainer, productToAdd, productStore) => {
  cartItemsContainer.insertAdjacentHTML('beforeend', CartUtils.createCartItemHTML(productToAdd));
  productStore.dispatch(productActions.decreaseStock(productToAdd.id, 1));
};

// 수량 변경 처리 함수
const handleQuantityChange = (event, target, handleCalculateCartStuff, onUpdateSelectOptions, productStore) => {
  const cartItemElement = target.closest('.cart-item');
  if (!cartItemElement) return;

  const productId = cartItemElement.id;
  const quantityChange = parseInt(target.dataset.change);
  const product = ProductUtils.findProductById(productId, productStore.getState().products);

  if (!product) return;

  const currentQuantity = CartUtils.getQuantityFromCartItem(cartItemElement);
  const newQuantity = currentQuantity + quantityChange;

  if (newQuantity > 0 && newQuantity <= product.stockQuantity + currentQuantity) {
    CartUtils.setQuantityToCartItem(cartItemElement, newQuantity);
    productStore.dispatch(productActions.decreaseStock(productId, quantityChange));
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  } else if (newQuantity <= 0) {
    productStore.dispatch(productActions.increaseStock(productId, currentQuantity));
    cartItemElement.remove();
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  } else {
    alert('재고가 부족합니다.');
  }
};

// 아이템 제거 처리 함수
const handleRemoveItem = (target, handleCalculateCartStuff, onUpdateSelectOptions, productStore) => {
  const cartItemElement = target.closest('.cart-item');
  if (!cartItemElement) return;

  const productId = cartItemElement.id;
  const currentQuantity = CartUtils.getQuantityFromCartItem(cartItemElement);

  productStore.dispatch(productActions.increaseStock(productId, currentQuantity));
  cartItemElement.remove();
  handleCalculateCartStuff();
  onUpdateSelectOptions();
};

export const manualEventHandlers = {
  handleManualToggle: (uiStore) => {
    uiStore.dispatch(uiActions.toggleManualOverlay());
    const isVisible = uiStore.getState().isManualOverlayVisible;
    uiRenderer.renderManualOverlay(isVisible);
  },

  handleManualOverlayClick: (event, uiStore) => {
    if (event.target.id === 'manual-overlay') {
      uiStore.dispatch(uiActions.setManualOverlayVisible(false));
      uiRenderer.renderManualOverlay(false);
    }
  },

  handleManualClose: (uiStore) => {
    uiStore.dispatch(uiActions.setManualOverlayVisible(false));
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
