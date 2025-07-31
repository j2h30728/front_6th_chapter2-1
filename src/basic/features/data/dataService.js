// 🏪 데이터 변환 서비스
import { PRODUCT_DATA, PRODUCT_IDS } from '../../constants/index.js';

/**
 * 서버 데이터를 클라이언트 상태로 변환
 * @param {Object} serverData - 서버에서 받은 데이터
 * @returns {Array} 클라이언트 상태 배열
 */
export const transformServerDataToClientState = (serverData) => {
  return Object.entries(serverData).map(([key, data]) => ({
    id: PRODUCT_IDS[key],
    name: data.name,
    val: data.price,
    originalVal: data.price,
    q: data.stock,
    onSale: false,
    suggestSale: false,
  }));
};

/**
 * 초기 상품 상태 생성
 * @returns {Array} 초기 상품 상태 배열
 */
export const createInitialProductState = () => {
  return transformServerDataToClientState(PRODUCT_DATA);
};
