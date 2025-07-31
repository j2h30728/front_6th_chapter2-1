// 🧩 SummaryItem 컴포넌트
export const createSummaryItemHTML = (item, quantity) => /*html*/ `
  <div class="flex justify-between text-xs tracking-wide text-gray-400">
    <span>${item.name} x ${quantity}</span>
    <span>₩${(item.price * quantity).toLocaleString()}</span>
  </div>
`;
