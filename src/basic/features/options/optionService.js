/**
 * 옵션 관리 서비스
 */
export const optionService = {
  /**
   * 상품 옵션 업데이트
   * @param {Object} productStore - 상품 스토어
   * @param {Function} ProductUtils - 상품 유틸리티
   * @param {Object} UI_CONSTANTS - UI 상수
   */
  updateSelectOptions: (productStore, ProductUtils, UI_CONSTANTS) => {
    const sel = document.getElementById('product-select');

    const totalStock = productStore.getState().products.reduce((total, product) => total + product.stockQuantity, 0);

    // 상품을 option HTML로 변환하는 함수
    const createOptionHTML = (item) => {
      const getItemSaleIcon = () => ProductUtils.getSaleIcon(item);

      const getOptionClass = () => {
        if (item.stockQuantity === 0) return 'text-gray-400';
        if (item.onSale && item.suggestSale) return 'text-purple-600 font-bold';
        if (item.onSale) return 'text-red-500 font-bold';
        if (item.suggestSale) return 'text-blue-500 font-bold';
        return '';
      };

      const getOptionDisplayText = () => {
        const icon = getItemSaleIcon();
        if (item.stockQuantity === 0) {
          return `${item.name} - ${item.price}원 (품절)`;
        }

        if (item.onSale && item.suggestSale) {
          return `${icon}${item.name} - ${item.originalPrice}원 → ${item.price}원 (25% SUPER SALE!)`;
        } else if (item.onSale) {
          return `${icon}${item.name} - ${item.originalPrice}원 → ${item.price}원 (20% SALE!)`;
        } else if (item.suggestSale) {
          return `${icon}${item.name} - ${item.originalPrice}원 → ${item.price}원 (5% 추천할인!)`;
        } else {
          return `${item.name} - ${item.price}원`;
        }
      };

      const getOptionDisabled = () => {
        return `${item.stockQuantity === 0 ? 'disabled' : ''}`;
      };

      return `
        <option
          value="${item.id}"
          class="${getOptionClass()}"
          ${getOptionDisabled()}
        >
          ${getOptionDisplayText()}
        </option>
      `;
    };

    // 템플릿 리터럴로 옵션들 생성
    sel.innerHTML = productStore.getState().products.map(createOptionHTML).join('');

    // 재고 상태에 따른 스타일 적용
    sel.style.borderColor = totalStock < UI_CONSTANTS.TOTAL_STOCK_WARNING_THRESHOLD ? 'orange' : '';
  },
};
