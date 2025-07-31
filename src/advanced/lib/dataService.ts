import { PRODUCT_DATA, PRODUCT_IDS } from './constants';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  onSale: boolean;
  suggestSale: boolean;
}

/**
 * 데이터를 상태로 변환
 * @param data - 데이터
 * @returns 상태 배열
 */
export const transformDataToState = (data: typeof PRODUCT_DATA): Product[] => {
  return Object.entries(data).map(([key, value]) => ({
    id: PRODUCT_IDS[key as keyof typeof PRODUCT_IDS],
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
 * @returns 초기 상품 상태 배열
 */
export const createInitialProductState = (): Product[] => {
  return transformDataToState(PRODUCT_DATA);
};
