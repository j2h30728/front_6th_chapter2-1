// 💰 가격 업데이트 로직 모듈
import { ProductUtils } from './productUtils.js';

/**
 * 장바구니 아이템 가격 업데이트
 * @param {HTMLElement} cartItem - 장바구니 아이템 요소
 * @param {Object} product - 상품 객체
 */
export const updateCartItemPrice = (cartItem, product) => {
  if (!cartItem || !product) return;

  const priceElement = cartItem.querySelector('.cart-item-price');
  const nameElement = cartItem.querySelector('.cart-item-name');

  const priceHTML = ProductUtils.getPriceHTML(product);
  const icon = ProductUtils.getSaleIcon(product);
  const nameText = `${icon}${product.name}`;

  if (priceElement) {
    priceElement.innerHTML = priceHTML;
  }
  if (nameElement) {
    nameElement.textContent = nameText;
  }
};

/**
 * 장바구니 내 모든 가격 업데이트
 * @param {Function} getElement - DOM 요소 가져오기 함수
 * @param {Object} productStore - 상품 스토어
 * @param {Function} handleCalculateCartStuff - 장바구니 계산 함수
 */
export const doUpdatePricesInCart = (getElement, productStore, handleCalculateCartStuff) => {
  const cartDisp = getElement('cart-items');
  if (!cartDisp) return;

  const cartItems = Array.from(cartDisp.children);

  cartItems
    .map((cartItem) => ({
      cartItem,
      product: ProductUtils.findProductById(cartItem.id, productStore.getState().products),
    }))
    .filter(({ product }) => product)
    .forEach(({ cartItem, product }) => {
      updateCartItemPrice(cartItem, product);
    });

  handleCalculateCartStuff();
};
