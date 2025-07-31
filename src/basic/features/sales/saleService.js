import { DISCOUNT_POLICIES, TIMER_SETTINGS } from '../../constants/index.js';

/**
 * 세일 서비스
 */
export const saleService = {
  /**
   * 번개세일 시작
   * @param {Object} productStore - 상품 스토어
   * @param {Function} onUpdateSelectOptions - 옵션 업데이트 함수
   * @param {Function} doUpdatePricesInCart - 가격 업데이트 함수
   */
  startLightningSale: (productStore, onUpdateSelectOptions, doUpdatePricesInCart) => {
    const lightningDelay = Math.random() * TIMER_SETTINGS.LIGHTNING_SALE_DELAY_MAX;

    setTimeout(() => {
      setInterval(function () {
        const randomProductIndex = Math.floor(Math.random() * productStore.getState().products.length);
        const randomProduct = productStore.getState().products[randomProductIndex];

        if (randomProduct.stockQuantity > 0 && !randomProduct.onSale) {
          const newPrice = Math.round(
            randomProduct.originalPrice * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.LIGHTNING_SALE.RATE)
          );

          productStore.dispatch({
            type: 'SET_PRODUCT_PRICE',
            payload: {
              productId: randomProduct.id,
              price: newPrice,
            },
          });

          productStore.dispatch({
            type: 'SET_SALE_STATUS',
            payload: {
              productId: randomProduct.id,
              onSale: true,
              suggestSale: false,
            },
          });

          alert('⚡번개세일! ' + randomProduct.name + '이(가) 20% 할인 중입니다!');
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }, TIMER_SETTINGS.LIGHTNING_SALE_INTERVAL);
    }, lightningDelay);
  },

  /**
   * 추천세일 시작
   * @param {Object} cartStore - 장바구니 스토어
   * @param {Object} productStore - 상품 스토어
   * @param {Function} onUpdateSelectOptions - 옵션 업데이트 함수
   * @param {Function} doUpdatePricesInCart - 가격 업데이트 함수
   */
  startRecommendedSale: (cartStore, productStore, onUpdateSelectOptions, doUpdatePricesInCart) => {
    setTimeout(function () {
      setInterval(function () {
        const lastSelectedProductId = cartStore.getState().lastSelectedProductId;
        if (!lastSelectedProductId) return;

        const recommendedProduct = findRecommendedProduct(productStore, lastSelectedProductId);
        if (!recommendedProduct) return;

        applyRecommendedSale(recommendedProduct, productStore, onUpdateSelectOptions, doUpdatePricesInCart);
      }, TIMER_SETTINGS.RECOMMENDED_SALE_INTERVAL);
    }, Math.random() * TIMER_SETTINGS.RECOMMENDED_SALE_DELAY_MAX);
  },

  /**
   * 모든 세일 시작
   * @param {Object} cartStore - 장바구니 스토어
   * @param {Object} productStore - 상품 스토어
   * @param {Function} onUpdateSelectOptions - 옵션 업데이트 함수
   * @param {Function} doUpdatePricesInCart - 가격 업데이트 함수
   */
  startAllSales: (cartStore, productStore, onUpdateSelectOptions, doUpdatePricesInCart) => {
    saleService.startLightningSale(productStore, onUpdateSelectOptions, doUpdatePricesInCart);
    saleService.startRecommendedSale(cartStore, productStore, onUpdateSelectOptions, doUpdatePricesInCart);
  },
};

// 추천 상품 찾기 함수
export const findRecommendedProduct = (productStore, lastSelectedProductId) => {
  const products = productStore.getState().products;

  for (let productIndex = 0; productIndex < products.length; productIndex++) {
    const product = products[productIndex];

    if (product.id === lastSelectedProductId) continue;
    if (product.stockQuantity <= 0) continue;
    if (product.suggestSale) continue;

    return product;
  }

  return null;
};

// 추천 세일 적용 함수
export const applyRecommendedSale = (recommendedProduct, productStore, onUpdateSelectOptions, doUpdatePricesInCart) => {
  alert('💝 ' + recommendedProduct.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');

  const newPrice = Math.round(
    recommendedProduct.price * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.RECOMMENDED_SALE.RATE)
  );

  productStore.dispatch({
    type: 'SET_PRODUCT_PRICE',
    payload: {
      productId: recommendedProduct.id,
      price: newPrice,
    },
  });

  productStore.dispatch({
    type: 'SET_SALE_STATUS',
    payload: {
      productId: recommendedProduct.id,
      onSale: false,
      suggestSale: true,
    },
  });

  onUpdateSelectOptions();
  doUpdatePricesInCart();
};
