import { useOrderCalculation } from '../../hooks';

const OrderSummary = () => {
  const { cartItemsWithDetails, discountResult, points, pointsDetail, totalDiscountRate } = useOrderCalculation();
  const { finalTotal, discounts, isTuesday } = discountResult;

  // 서브토탈 계산 (UI 표시용)
  const subtotal = cartItemsWithDetails.reduce((total, item) => {
    const { onSale, discountPrice, price, quantity } = item;
    const finalPrice = onSale ? discountPrice : price;
    return total + (finalPrice || 0) * (quantity || 0);
  }, 0);

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {cartItemsWithDetails.map((item) => (
            <div key={item.id} className="flex justify-between text-xs tracking-wide text-gray-400">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>
                ₩{(((item.onSale ? item.discountPrice : item.price) || 0) * (item.quantity || 0)).toLocaleString()}
              </span>
            </div>
          ))}

          {cartItemsWithDetails.length > 0 && (
            <>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between text-sm tracking-wide">
                <span>Subtotal</span>
                <span>₩{subtotal.toLocaleString()}</span>
              </div>

              {discounts.map((discount, index) => (
                <div key={index} className="flex justify-between text-sm tracking-wide text-green-400">
                  <span className="text-xs">{discount.name}</span>
                  <span className="text-xs">-₩{discount.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between text-sm tracking-wide text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-auto">
          <div id="discount-info" className="mb-4"></div>
          <div className="pt-5 border-t border-white/10" id="cart-total" data-testid="cart-total">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="cart-total-amount text-2xl tracking-tight">₩{finalTotal.toLocaleString()}</div>
            </div>
            {totalDiscountRate > 0 && (
              <div className="text-xs text-green-400 mt-1 text-right">총 할인률: {totalDiscountRate}%</div>
            )}
            <div className="text-xs text-blue-400 mt-2 text-right" id="loyalty-points" data-testid="loyalty-points">
              <div>적립 포인트: {points}p</div>
              {pointsDetail.length > 0 && <div className="text-2xs opacity-70 mt-1">{pointsDetail.join(', ')}</div>}
            </div>
          </div>
          {isTuesday && cartItemsWithDetails.length > 0 && (
            <div id="tuesday-special" className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xs">🎉</span>
                <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        className={`w-full py-4 text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 ${
          cartItemsWithDetails.length > 0 ? 'bg-white text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        disabled={cartItemsWithDetails.length === 0}
      >
        {cartItemsWithDetails.length > 0 ? 'Proceed to Checkout' : 'Add items to cart'}
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};

export default OrderSummary;
