// 🏪 상품 도메인 Store
import createStore from '../../utils/createStore.js';

// 🏪 상품 리듀서
const productReducer = (state, action) => {
  switch (action.type) {
    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, q: Math.max(0, product.q - action.payload.quantity) }
            : product
        ),
      };
    case 'INCREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, q: product.q + action.payload.quantity } : product
        ),
      };
    case 'SET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: action.payload.newPrice,
                onSale: action.payload.onSale,
                suggestSale: action.payload.suggestSale || product.suggestSale,
              }
            : product
        ),
      };
    case 'RESET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                val: product.originalVal,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };
    case 'SET_PRODUCT_PRICE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, val: action.payload.price } : product
        ),
      };
    case 'RESET_PRODUCT_PRICE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, val: product.originalVal } : product
        ),
      };
    case 'SET_SALE_STATUS':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                onSale: action.payload.onSale || false,
                suggestSale: action.payload.suggestSale || false,
              }
            : product
        ),
      };
    case 'RESET_SALE_STATUS':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };
    default:
      return state;
  }
};

// 🏪 상품 Store 인스턴스 (초기 상태는 외부에서 주입)
const createProductStore = (initialState) => {
  return createStore(productReducer, initialState);
};

export default createProductStore;
