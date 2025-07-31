// 🧩 ItemDiscount 컴포넌트
export const createItemDiscountHTML = (discountInfo) => /*html*/ `
  <div class="flex justify-between text-sm tracking-wide text-green-400">
    <span class="text-xs">${discountInfo.name} (10개↑)</span>
    <span class="text-xs">-${discountInfo.discount}%</span>
  </div>
`;
