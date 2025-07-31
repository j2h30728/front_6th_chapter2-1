// 🎯 상품 도메인 유틸리티 함수들

/**
 * 상품 ID로 상품 찾기
 * @param {string} productId - 상품 ID
 * @param {Array} products - 상품 배열
 * @returns {Object|null} 찾은 상품 또는 null
 */
export const findProductById = (productId, products) => {
  return products.find((product) => product.id === productId);
};

/**
 * 상품 할인 아이콘 가져오기
 * @param {Object} item - 상품 객체
 * @returns {string} 할인 아이콘 문자열
 */
export const getSaleIcon = (item) => {
  if (item.onSale && item.suggestSale) return '⚡💝';
  if (item.onSale) return '⚡';
  if (item.suggestSale) return '💝';
  return '';
};

/**
 * 상품 가격 HTML 생성
 * @param {Object} item - 상품 객체
 * @returns {string} 가격 HTML 문자열
 */
export const getPriceHTML = (item) => {
  if (!item.onSale && !item.suggestSale) {
    return `₩${item.val.toLocaleString()}`;
  }

  const colorClass =
    item.onSale && item.suggestSale ? 'text-purple-600' : item.onSale ? 'text-red-500' : 'text-blue-500';

  return `
    <span class="line-through text-gray-400">₩${item.originalVal.toLocaleString()}</span>
    <span class="${colorClass}">₩${item.val.toLocaleString()}</span>
  `;
};

/**
 * 상품 재고 상태 메시지 생성
 * @param {Object} item - 상품 객체
 * @returns {string|null} 재고 메시지 또는 null
 */
export const createStockMessage = (item) => {
  if (item.q === 0) {
    return `${item.name}: 품절`;
  } else if (item.q < 5) {
    return `${item.name}: 재고 부족 (${item.q}개 남음)`;
  }
  return null; // 재고 충분한 경우
};
