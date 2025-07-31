import { STOCK_CALCULATION } from '../../constants/index.js';

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
    const selectElement = document.getElementById('product-select');
    if (!selectElement) return;

    const totalStock = calculateTotalStock(productStore);
    const optionHTML = createAllOptionsHTML(productStore, ProductUtils);

    selectElement.innerHTML = optionHTML;
    applyStockWarningStyle(selectElement, totalStock, UI_CONSTANTS);
  },
};

// 총 재고 계산 함수
const calculateTotalStock = (productStore) => {
  return productStore.getState().products.reduce((total, product) => total + product.stockQuantity, 0);
};

// 모든 옵션 HTML 생성 함수
const createAllOptionsHTML = (productStore, ProductUtils) => {
  return productStore
    .getState()
    .products.map((item) => createOptionHTML(item, ProductUtils))
    .join('');
};

// 개별 옵션 HTML 생성 함수
const createOptionHTML = (item, ProductUtils) => {
  const optionClass = getOptionClass(item);
  const displayText = getOptionDisplayText(item, ProductUtils);
  const disabledAttr = getOptionDisabled(item);

  return `
    <option
      value="${item.id}"
      class="${optionClass}"
      ${disabledAttr}
    >
      ${displayText}
    </option>
  `;
};

// 옵션 클래스 결정 함수
const getOptionClass = (item) => {
  if (item.stockQuantity === STOCK_CALCULATION.ZERO_STOCK) return 'text-gray-400';
  if (item.onSale && item.suggestSale) return 'text-purple-600 font-bold';
  if (item.onSale) return 'text-red-500 font-bold';
  if (item.suggestSale) return 'text-blue-500 font-bold';
  return '';
};

// 옵션 표시 텍스트 생성 함수
const getOptionDisplayText = (item, ProductUtils) => {
  const icon = ProductUtils.getSaleIcon(item);

  if (item.stockQuantity === STOCK_CALCULATION.ZERO_STOCK) {
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

// 옵션 비활성화 속성 결정 함수
const getOptionDisabled = (item) => {
  return item.stockQuantity === STOCK_CALCULATION.ZERO_STOCK ? 'disabled' : '';
};

// 재고 경고 스타일 적용 함수
const applyStockWarningStyle = (selectElement, totalStock, UI_CONSTANTS) => {
  selectElement.style.borderColor = totalStock < UI_CONSTANTS.TOTAL_STOCK_WARNING_THRESHOLD ? 'orange' : '';
};
