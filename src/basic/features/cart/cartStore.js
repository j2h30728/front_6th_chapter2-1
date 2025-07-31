// 🛒 장바구니 도메인 Store
import { UI_CONSTANTS } from '../../constants/index.js';
import createStore from '../../utils/createStore.js';

// 🛒 장바구니 리듀서
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEM_COUNT':
      return { ...state, itemCnt: action.payload };
    case 'RESET_ITEM_COUNT':
      return { ...state, itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT };
    case 'ADD_TO_ITEM_COUNT':
      return { ...state, itemCnt: state.itemCnt + action.payload };
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmt: action.payload };
    case 'ADD_TO_TOTAL_AMOUNT':
      return { ...state, totalAmt: state.totalAmt + action.payload };
    case 'SET_LAST_SELECTED':
      return { ...state, lastSel: action.payload };
    case 'RESET_CART':
      return {
        ...state,
        itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
        totalAmt: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
        lastSel: null,
      };
    default:
      return state;
  }
};

// 🛒 장바구니 Store 인스턴스
const cartStore = createStore(cartReducer, {
  itemCnt: UI_CONSTANTS.DEFAULT_ITEM_COUNT,
  totalAmt: UI_CONSTANTS.DEFAULT_TOTAL_AMOUNT,
  lastSel: null,
});

export default cartStore;
