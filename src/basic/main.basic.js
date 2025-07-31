import {
  createCartItems,
  createHeader,
  createManualOverlay,
  createManualToggleButton,
  createProductSelector,
  createRightColumn,
} from './components/index.js';
import { STOCK_POLICIES, UI_CONSTANTS } from './constants/index.js';
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
import { doRenderBonusPoints } from './features/points/pointRenderers.js';
import { doUpdatePricesInCart } from './features/product/priceUpdaters.js';
import { ProductUtils } from './features/product/productUtils.js';
import { updateAllUI } from './features/ui/uiUpdaters.js';
import { getElement } from './utils/index.js';

const productStore = createProductStore({
  products: createInitialProductState(),
});

const createMainContent = () => /*html*/ `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    ${createProductSelector()}
    ${createCartItems()}
  </div>
`;

const createApp = () => /*html*/ `
  ${createHeader()}
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
    ${createMainContent()}
    ${createRightColumn()}
  </div>
  ${createManualToggleButton()}
  ${createManualOverlay()}
`;

const onUpdateSelectOptions = () => {
  optionService.updateSelectOptions(productStore, ProductUtils, UI_CONSTANTS);
};

const handleCalculateCartStuff = () => {
  updateAllUI(getElement, productStore, cartStore, uiStore, uiRenderer, STOCK_POLICIES);
  doRenderBonusPoints(getElement, cartStore, productStore);
};

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

main();
