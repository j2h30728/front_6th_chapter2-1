import { ProductUtils } from '../product/productUtils.js';

/**
 * 장바구니 도메인 유틸리티 객체
 */
export const CartUtils = {
  /**
   * 장바구니 아이템에서 수량 가져오기
   * @param {HTMLElement} cartItem - 장바구니 아이템 요소
   * @returns {number} 수량
   */
  getQuantityFromCartItem(cartItem) {
    const quantityElement = cartItem.querySelector('.cart-item-content .quantity-number');
    return quantityElement ? parseInt(quantityElement.textContent) || 0 : 0;
  },

  /**
   * 장바구니 아이템에 수량 설정하기
   * @param {HTMLElement} cartItem - 장바구니 아이템 요소
   * @param {number} quantity - 설정할 수량
   */
  setQuantityToCartItem(cartItem, quantity) {
    const quantityElement = cartItem.querySelector('.cart-item-content .quantity-number');
    if (quantityElement) {
      quantityElement.textContent = quantity;
    }
  },

  /**
   * 장바구니 아이템 HTML 생성
   * @param {Object} item - 상품 객체
   * @returns {string} 장바구니 아이템 HTML
   */
  createCartItemHTML(item) {
    const icon = ProductUtils.getSaleIcon(item);
    const priceHTML = ProductUtils.getPriceHTML(item);

    return `
      <div
        id="${item.id}"
        class="cart-item grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
      >
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>

        <div class="cart-item-content">
          <h3 class="cart-item-name text-base font-normal mb-1 tracking-tight">${icon}${item.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${priceHTML}</p>

          <div class="flex items-center gap-4">
            <button
              class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
              data-product-id="${item.id}"
              data-change="-1"
            >−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button
              class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
              data-product-id="${item.id}"
              data-change="1"
            >+</button>
          </div>
        </div>

        <div class="cart-item-price-container text-right">
          <div class="cart-item-price text-lg mb-2 tracking-tight tabular-nums">${priceHTML}</div>
          <a
            class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
            data-product-id="${item.id}"
          >Remove</a>
        </div>
      </div>
    `;
  },
};
