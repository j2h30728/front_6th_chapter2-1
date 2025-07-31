// 🧩 컴포넌트 imports
import {
  createCartItems,
  createHeader,
  createManualOverlay,
  createManualToggleButton,
  createProductSelector,
  createRightColumn,
} from './components/index.js';
// 🏪 상수들 import
import { STOCK_POLICIES, UI_CONSTANTS } from './constants/index.js';
// 🧮 계산 로직 imports
import { calculateCartData } from './features/calculations/cartCalculations.js';
// 🏪 기능 모듈 imports
import {
  cartStore,
  createInitialProductState,
  createProductStore,
  optionService,
  registerEventListeners,
  saleService,
  setupObservers,
  uiRenderer,
  uiStore,
} from './features/index.js';
// 🎯 포인트 렌더링 imports
import { doRenderBonusPoints } from './features/points/pointRenderers.js';
// 💰 가격 업데이트 imports
import { doUpdatePricesInCart } from './features/product/priceUpdaters.js';
// � 상품 관련 imports
import { ProductUtils } from './features/product/productUtils.js';
// � UI 업데이트 imports
import { updateAllUI } from './features/ui/uiUpdaters.js';
// 🛠️ 유틸리티 imports
import { getElement } from './utils/index.js';

// 🏪 Product Store 초기화
const productStore = createProductStore({
  products: createInitialProductState(),
});

// 🧩 컴포넌트 조합 함수
const createMainContent = () => /*html*/ `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    ${createProductSelector()}
    ${createCartItems()}
  </div>
`;

// 🏗️ 앱 전체 구조 조합
const createApp = () => /*html*/ `
  ${createHeader()}
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
    ${createMainContent()}
    ${createRightColumn()}
  </div>
  ${createManualToggleButton()}
  ${createManualOverlay()}
`;

// 🏪 옵션 업데이트 함수
const onUpdateSelectOptions = () => {
  optionService.updateSelectOptions(productStore, ProductUtils, UI_CONSTANTS);
};

// 🎯 메인 계산 함수
const handleCalculateCartStuff = () => {
  const cartData = calculateCartData(getElement, productStore);
  const stores = { cartStore, uiStore, productStore };

  updateAllUI(cartData, stores, uiRenderer, STOCK_POLICIES);
  doRenderBonusPoints(getElement, cartStore, productStore);
};

// 🚀 앱 초기화 함수
function main() {
  cartStore.dispatch({ type: 'RESET_CART' });

  const root = document.getElementById('app');
  root.innerHTML = createApp();

  setupObservers(cartStore, productStore, uiStore, uiRenderer);
  registerEventListeners(handleCalculateCartStuff, onUpdateSelectOptions, cartStore, productStore, uiStore);

  onUpdateSelectOptions();
  handleCalculateCartStuff();
  saleService.startAllSales(cartStore, productStore, onUpdateSelectOptions, () =>
    doUpdatePricesInCart(getElement, productStore, handleCalculateCartStuff)
  );
}

// 앱 실행
main();
