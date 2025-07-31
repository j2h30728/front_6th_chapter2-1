import { UI_CONSTANTS } from '../../constants/index.js';
import createStore from '../../utils/createStore.js';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEM_COUNT':
      return { ...state, itemCount: action.payload };
    case 'RESET_ITEM_COUNT':
      return { ...state, itemCount: UI_CONSTANTS.DEFAULT_ITEM_COUNT };
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
        ...state,
        itemCount: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
        totalAmount: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
        lastSelectedProductId: null,
      };
    default:
      return state;
  }
};

const cartStore = createStore(cartReducer, {
  itemCount: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
  totalAmount: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
  lastSelectedProductId: null,
});

export default cartStore;
