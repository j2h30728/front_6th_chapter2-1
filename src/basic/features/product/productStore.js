import createStore from '../../utils/createStore.js';

const productReducer = (state, action) => {
  switch (action.type) {
    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - action.payload.quantity) }
            : product
        ),
      };
    case 'INCREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, stockQuantity: product.stockQuantity + action.payload.quantity }
            : product
        ),
      };
    case 'SET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                price: action.payload.newPrice,
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
                price: product.originalPrice,
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
          product.id === action.payload.productId ? { ...product, price: action.payload.price } : product
        ),
      };
    case 'RESET_PRODUCT_PRICE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId ? { ...product, price: product.originalPrice } : product
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

const createProductStore = (initialState) => {
  return createStore(productReducer, initialState);
};

// 🏪 상품 액션 생성자
export const productActions = {
  decreaseStock: (productId, quantity) => ({
    type: 'DECREASE_STOCK',
    payload: { productId, quantity },
  }),
  increaseStock: (productId, quantity) => ({
    type: 'INCREASE_STOCK',
    payload: { productId, quantity },
  }),
  setProductSale: (productId, onSale, suggestSale) => ({
    type: 'SET_PRODUCT_SALE',
    payload: { productId, onSale, suggestSale },
  }),
  setProductPrice: (productId, price) => ({
    type: 'SET_PRODUCT_PRICE',
    payload: { productId, price },
  }),
  setSaleStatus: (productId, onSale, suggestSale) => ({
    type: 'SET_SALE_STATUS',
    payload: { productId, onSale, suggestSale },
  }),
};

export default createProductStore;
