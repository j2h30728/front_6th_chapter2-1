// 🏪 세일 서비스
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
        const luckyIdx = Math.floor(Math.random() * productStore.getState().products.length);
        const luckyItem = productStore.getState().products[luckyIdx];

        if (luckyItem.q > 0 && !luckyItem.onSale) {
          const newPrice = Math.round(
            luckyItem.originalVal * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.LIGHTNING_SALE.RATE)
          );

          // 가격 변경
          productStore.dispatch({
            type: 'SET_PRODUCT_PRICE',
            payload: {
              productId: luckyItem.id,
              price: newPrice,
            },
          });

          // 상태 변경 (번개세일)
          productStore.dispatch({
            type: 'SET_SALE_STATUS',
            payload: {
              productId: luckyItem.id,
              onSale: true,
              suggestSale: false,
            },
          });

          alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
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
        if (cartStore.getState().lastSel) {
          let suggest = null;

          for (let k = 0; k < productStore.getState().products.length; k++) {
            if (productStore.getState().products[k].id !== cartStore.getState().lastSel) {
              if (productStore.getState().products[k].q > 0) {
                if (!productStore.getState().products[k].suggestSale) {
                  suggest = productStore.getState().products[k];
                  break;
                }
              }
            }
          }

          if (suggest) {
            alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
            const newPrice = Math.round(suggest.val * (1 - DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.RECOMMENDED_SALE.RATE));

            // 가격 변경
            productStore.dispatch({
              type: 'SET_PRODUCT_PRICE',
              payload: {
                productId: suggest.id,
                price: newPrice,
              },
            });

            // 상태 변경 (추천할인)
            productStore.dispatch({
              type: 'SET_SALE_STATUS',
              payload: {
                productId: suggest.id,
                onSale: false,
                suggestSale: true,
              },
            });

            onUpdateSelectOptions();
            doUpdatePricesInCart();
          }
        }
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
