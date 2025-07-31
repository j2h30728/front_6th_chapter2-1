// 🏪 데이터 변환 서비스
import { PRODUCT_DATA, PRODUCT_IDS } from '../../constants/index.js';

/**
 * 데이터를 상태로 변환
 * @param {Object} data -  데이터
 * @returns {Array}  상태 배열
 */
export const transformDataToState = (data) => {
  return Object.entries(data).map(([key, value]) => ({
    id: PRODUCT_IDS[key],
    name: value.name,
    price: value.price,
    originalPrice: value.price,
    stockQuantity: value.stock,
    onSale: false,
    suggestSale: false,
  }));
};

/**
 * 초기 상품 상태 생성
 * @returns {Array} 초기 상품 상태 배열
 */
export const createInitialProductState = () => {
  return transformDataToState(PRODUCT_DATA);
};
