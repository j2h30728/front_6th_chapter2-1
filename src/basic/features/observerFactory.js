import { createCartObserver } from './cart/cartObserver.js';
import { createProductObserver } from './product/productObserver.js';
import { createUIObserver } from './ui/uiObserver.js';

/**
 * 모든 도메인 옵저버를 생성하고 구독시키는 팩토리 함수
 * @param {Object} stores - 모든 store 객체들
 * @param {Object} handlers - UI 업데이트 핸들러들
 * @param {Object} uiRenderer - UI 렌더링 모듈
 * @returns {Object} 생성된 옵저버들
 */
export const createObservers = (stores, handlers, uiRenderer) => {
  const observers = {
    cart: createCartObserver(stores.cart),
    product: createProductObserver(stores.product, handlers),
    ui: createUIObserver(stores.ui, uiRenderer),
  };

  return observers;
};

/**
 * 모든 옵저버를 구독시키는 함수
 * @param {Object} observers - 생성된 옵저버들
 */
export const subscribeObservers = (observers) => {
  Object.values(observers).forEach((observer) => observer.subscribe());
};

/**
 * 옵저버 생성과 구독을 한번에 처리하는 함수
 * @param {Object} stores - 모든 store 객체들
 * @param {Object} handlers - UI 업데이트 핸들러들
 * @param {Object} uiRenderer - UI 렌더링 모듈
 * @returns {Object} 구독된 옵저버들
 */
export const setupObservers = (stores, handlers, uiRenderer) => {
  const observers = createObservers(stores, handlers, uiRenderer);
  subscribeObservers(observers);
  return observers;
};
