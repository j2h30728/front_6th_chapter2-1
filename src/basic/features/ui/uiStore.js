import { UI_CONSTANTS } from '../../constants/index.js';
import createStore from '../../utils/createStore.js';

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_MANUAL_OVERLAY':
      return { ...state, isManualOverlayVisible: !state.isManualOverlayVisible };
    case 'SET_MANUAL_OVERLAY_VISIBLE':
      return { ...state, isManualOverlayVisible: action.payload };
    case 'TOGGLE_TUESDAY_SPECIAL':
      return { ...state, isTuesdaySpecialVisible: action.payload };
    case 'SET_DISCOUNT_INFO_VISIBLE':
      return { ...state, isDiscountInfoVisible: action.payload };
    case 'SET_STOCK_MESSAGE':
      return { ...state, stockMessage: action.payload };
    case 'SET_ITEM_COUNT_DISPLAY':
      return { ...state, itemCountDisplay: action.payload };
    case 'SET_POINTS_DISPLAY':
      return { ...state, pointsDisplay: action.payload };
    case 'RESET_UI_STATE':
      return {
        ...state,
        isManualOverlayVisible: false,
        isTuesdaySpecialVisible: false,
        isDiscountInfoVisible: false,
        stockMessage: '',
        itemCountDisplay: UI_CONSTANTS.DEFAULT_ITEM_COUNT_DISPLAY,
        pointsDisplay: UI_CONSTANTS.DEFAULT_POINTS_DISPLAY,
      };
    default:
      return state;
  }
};

const uiStore = createStore(uiReducer, {
  isManualOverlayVisible: false,
  isTuesdaySpecialVisible: false,
  isDiscountInfoVisible: false,
  stockMessage: '',
  itemCountDisplay: UI_CONSTANTS.DEFAULT_ITEM_COUNT_DISPLAY,
  pointsDisplay: UI_CONSTANTS.DEFAULT_POINTS_DISPLAY,
});

export default uiStore;
