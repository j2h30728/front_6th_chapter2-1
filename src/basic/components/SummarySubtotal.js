// 🧩 SummarySubtotal 컴포넌트
export const createSummarySubtotalHTML = (subtotal) => /*html*/ `
  <div class="border-t border-white/10 my-3"></div>
  <div class="flex justify-between text-sm tracking-wide">
    <span>Subtotal</span>
    <span>₩${subtotal.toLocaleString()}</span>
  </div>
`;
