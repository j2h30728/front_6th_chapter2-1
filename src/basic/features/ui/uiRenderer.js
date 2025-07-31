import { UI_CONSTANTS } from '../../constants/index.js';
import { formatNumber, when, whenValue } from '../../utils/dataUtils.js';
import { getElement, querySelector, setInnerHTML, setStyle, setTextContent } from '../../utils/domUtils.js';
import { CartUtils } from '../cart/cartUtils.js';

const uiRenderer = {
  renderCartDisplay: (totalItems, finalTotal) => {
    setTextContent('item-count', `🛍️ ${totalItems} items in cart`);

    const totalDiv = querySelector(getElement('cart-total'), '.cart-total-amount');
    if (totalDiv) {
      totalDiv.textContent = `₩${finalTotal.toLocaleString()}`;
    }
  },

  renderPointsDisplay: (totalPoints) => {
    const pointsDisplay = whenValue(totalPoints > 0, `적립 포인트: ${totalPoints}p`, '적립 포인트: 0p');
    setTextContent('loyalty-points', pointsDisplay);
    setStyle('loyalty-points', 'display', 'block');
  },

  renderTuesdaySpecial: (isTuesday, finalTotal) => {
    const tuesdaySpecial = getElement('tuesday-special');
    if (tuesdaySpecial) {
      if (isTuesday && finalTotal > 0) {
        tuesdaySpecial.classList.remove('hidden');
      } else {
        tuesdaySpecial.classList.add('hidden');
      }
    }
  },

  renderStockMessages: (stockMessages) => {
    const stockMsg = stockMessages.join('\n');
    setTextContent('stock-status', stockMsg);
  },

  renderSummaryDetails: (summaryItems) => {
    setInnerHTML('summary-details', summaryItems.join(''));
  },

  renderDiscountInfo: (totalDiscountRate, savedAmount) => {
    const discountInfoDiv = getElement('discount-info');
    if (totalDiscountRate > 0 && savedAmount > 0) {
      discountInfoDiv.innerHTML = /*html*/ `
        <div class="bg-green-500/20 rounded-lg p-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
            <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
          </div>
          <div class="text-2xs text-gray-300">₩${formatNumber(savedAmount)} 할인되었습니다</div>
        </div>
      `;
    } else {
      discountInfoDiv.innerHTML = '';
    }
  },

  renderCartItemStyles: (cartItems) => {
    Array.from(cartItems).forEach((cartItem) => {
      const quantity = CartUtils.getQuantityFromCartItem(cartItem);
      const priceElems = cartItem.querySelectorAll('.cart-item-price');

      priceElems.forEach((elem) => {
        elem.style.fontWeight = whenValue(quantity >= UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD, 'bold', 'normal');
      });
    });
  },

  renderManualOverlay: (isVisible) => {
    const manualOverlay = getElement('manual-overlay');
    const manualColumn = getElement('manual-column');

    when(isVisible, () => {
      manualOverlay.classList.remove('hidden');
      manualColumn.classList.remove('translate-x-full');
    });

    when(!isVisible, () => {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    });
  },
};

export default uiRenderer;
