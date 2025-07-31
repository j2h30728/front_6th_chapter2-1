import { DISCOUNT_POLICIES, TIMER_SETTINGS } from './constants';
import { Product } from './products';
import { AppAction } from './store';

/**
 * 세일 서비스
 */
export const saleService = {
  /**
   * 번개세일 시작
   * @param {Function} dispatch - 액션 디스패치 함수
   * @param {Array} products - 상품 목록
   */
  startLightningSale: (dispatch: React.Dispatch<AppAction>, products: Product[]) => {
    const lightningDelay = Math.random() * TIMER_SETTINGS.LIGHTNING_SALE_DELAY_MAX;

    setTimeout(() => {
      setInterval(() => {
        const availableProducts = products.filter((product) => product.quantity > 0 && !product.onSale);
        if (availableProducts.length === 0) return;

        const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
        const newPrice = Math.round(
          randomProduct.price * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.LIGHTNING_SALE.RATE)
        );

        dispatch({
          type: 'SET_PRODUCT_SALE',
          payload: {
            productId: randomProduct.id,
            newPrice,
            onSale: true,
            suggestSale: false,
          },
        });

        alert(`⚡번개세일! ${randomProduct.name}이(가) 20% 할인 중입니다!`);
      }, TIMER_SETTINGS.LIGHTNING_SALE_INTERVAL);
    }, lightningDelay);
  },

  /**
   * 추천세일 시작
   * @param {Function} dispatch - 액션 디스패치 함수
   * @param {Array} products - 상품 목록
   * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
   */
  startRecommendedSale: (dispatch: React.Dispatch<AppAction>, products: Product[], lastSelectedProductId: string) => {
    setTimeout(() => {
      setInterval(() => {
        if (!lastSelectedProductId) return;

        const recommendedProduct = findRecommendedProduct(products, lastSelectedProductId);
        if (!recommendedProduct) return;

        applyRecommendedSale(recommendedProduct, dispatch);
      }, TIMER_SETTINGS.RECOMMENDED_SALE_INTERVAL);
    }, Math.random() * TIMER_SETTINGS.RECOMMENDED_SALE_DELAY_MAX);
  },

  /**
   * 모든 세일 시작
   * @param {Function} dispatch - 액션 디스패치 함수
   * @param {Array} products - 상품 목록
   * @param {string} lastSelectedProductId - 마지막 선택된 상품 ID
   */
  startAllSales: (dispatch: React.Dispatch<AppAction>, products: Product[], lastSelectedProductId: string) => {
    saleService.startLightningSale(dispatch, products);
    saleService.startRecommendedSale(dispatch, products, lastSelectedProductId);
  },
};

// 추천 상품 찾기 함수
export const findRecommendedProduct = (products: Product[], lastSelectedProductId: string) => {
  for (let productIndex = 0; productIndex < products.length; productIndex++) {
    const product = products[productIndex];

    if (product.id === lastSelectedProductId) continue;
    if (product.quantity <= 0) continue;
    if (product.suggestSale) continue;

    return product;
  }

  return null;
};

// 추천 세일 적용 함수
export const applyRecommendedSale = (recommendedProduct: Product, dispatch: React.Dispatch<AppAction>) => {
  alert(`💝 ${recommendedProduct.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);

  const newPrice = Math.round(
    recommendedProduct.price * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.RECOMMENDED_SALE.RATE)
  );

  dispatch({
    type: 'SET_PRODUCT_SALE',
    payload: {
      productId: recommendedProduct.id,
      newPrice,
      onSale: false,
      suggestSale: true,
    },
  });
};
