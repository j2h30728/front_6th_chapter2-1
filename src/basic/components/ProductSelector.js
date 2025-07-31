// 🧩 ProductSelector 컴포넌트
export const createProductSelector = () => /*html*/ `
  <div class="mb-6 pb-6 border-b border-gray-200">
    <select id="product-select" class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"></select>
    <button id="add-to-cart" class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all">
      Add to Cart
    </button>
    <div id="stock-status" class="text-xs text-red-500 mt-3 whitespace-pre-line"></div>
  </div>
`;
