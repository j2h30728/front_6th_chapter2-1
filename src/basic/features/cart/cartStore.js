import createStore from '../../utils/createStore.js';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEM_COUNT':
      return { ...state, itemCount: action.payload };
    case 'RESET_ITEM_COUNT':
      return { ...state, itemCount: 0 };
    case 'ADD_TO_ITEM_COUNT':
      return { ...state, itemCount: state.itemCount + action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload };
    case 'ADD_TO_TOTAL_AMOUNT':
      return { ...state, totalAmount: state.totalAmount + action.payload };
    case 'SET_LAST_SELECTED_PRODUCT_ID':
      return { ...state, lastSelectedProductId: action.payload };
    case 'RESET_CART':
      return {
        itemCount: 0,
        totalAmount: 0,
        lastSelectedProductId: null,
      };
    default:
      return state;
  }
};

const cartStore = createStore(cartReducer, {
  itemCount: 0,
  totalAmount: 0,
  lastSelectedProductId: null,
});

// 🛒 장바구니 액션 생성자
export const cartActions = {
  setItemCount: (itemCount) => ({ type: 'SET_ITEM_COUNT', payload: itemCount }),
  resetItemCount: () => ({ type: 'RESET_ITEM_COUNT' }),
  addToItemCount: (amount) => ({ type: 'ADD_TO_ITEM_COUNT', payload: amount }),
  setTotalAmount: (totalAmount) => ({ type: 'SET_TOTAL_AMOUNT', payload: totalAmount }),
  addToTotalAmount: (amount) => ({ type: 'ADD_TO_TOTAL_AMOUNT', payload: amount }),
  setLastSelectedProductId: (productId) => ({ type: 'SET_LAST_SELECTED_PRODUCT_ID', payload: productId }),
  resetCart: () => ({ type: 'RESET_CART' }),
};

export default cartStore;
