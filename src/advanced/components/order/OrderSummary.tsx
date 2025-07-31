import { DISCOUNT_POLICIES, POINT_POLICIES, PRODUCT_IDS, UI_CONSTANTS } from '../../lib/constants';
import { useApp } from '../../lib/store';

const OrderSummary = () => {
  const { state } = useApp();
  const { cart, product } = state;

  // 장바구니 아이템과 상품 정보 결합
  const getCartItemsWithDetails = () => {
    return cart.items.map((cartItem) => {
      const productInfo = product.products.find((p) => p.id === cartItem.id);
      return {
        ...productInfo,
        quantity: cartItem.quantity,
      };
    });
  };

  // 서브토탈 계산
  const calculateSubtotal = () => {
    return getCartItemsWithDetails().reduce((total, item) => {
      const { onSale, discountPrice, price, quantity } = item;
      const finalPrice = onSale ? discountPrice : price;
      return total + (finalPrice || 0) * (quantity || 0);
    }, 0);
  };

  // 개별 상품 할인 계산
  const calculateIndividualDiscounts = () => {
    return getCartItemsWithDetails()
      .map((item) => {
        const { quantity, id, name, price } = item;

        if (quantity >= UI_CONSTANTS.QUANTITY_THRESHOLD_FOR_BOLD) {
          const discountRate =
            DISCOUNT_POLICIES.INDIVIDUAL_DISCOUNTS[id as keyof typeof DISCOUNT_POLICIES.INDIVIDUAL_DISCOUNTS];
          if (discountRate) {
            const originalPrice = (price || 0) * quantity;
            const discountedPrice = originalPrice * (1 - discountRate);
            return {
              name,
              discount: discountRate * 100,
              savings: originalPrice - discountedPrice,
            };
          }
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  // 할인 계산 (basic과 동일한 로직)
  const calculateDiscounts = () => {
    const subtotal = calculateSubtotal();
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const bulkDiscount =
      totalQuantity >= DISCOUNT_POLICIES.BULK_DISCOUNT.THRESHOLD ? DISCOUNT_POLICIES.BULK_DISCOUNT.RATE : 0;
    const today = new Date();
    const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
    const tuesdayDiscount = isTuesday && subtotal > 0 ? DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.RATE : 0;

    let finalTotal = subtotal;
    const discounts = [];

    // 개별 상품 할인 적용 (대량 할인이 없을 때만)
    if (bulkDiscount === 0) {
      const individualDiscounts = calculateIndividualDiscounts();
      individualDiscounts.forEach((discount) => {
        finalTotal -= discount.savings;
        discounts.push({
          name: `${discount.name} (10개↑)`,
          amount: discount.savings,
        });
      });
    }

    // 대량 할인 적용
    if (bulkDiscount > 0) {
      const bulkDiscountAmount = subtotal * bulkDiscount;
      finalTotal = subtotal * (1 - bulkDiscount);
      discounts.push({
        name: '🎉 대량구매 할인 (30개 이상)',
        amount: bulkDiscountAmount,
      });
    }

    // 화요일 할인 적용
    if (tuesdayDiscount > 0) {
      const tuesdayDiscountAmount = finalTotal * tuesdayDiscount;
      finalTotal = finalTotal * (1 - tuesdayDiscount);
      discounts.push({
        name: 'Tuesday Special 10%',
        amount: tuesdayDiscountAmount,
      });
    }

    return {
      finalTotal,
      discounts,
      isTuesday,
      bulkDiscount: bulkDiscount > 0,
      tuesdayDiscount: tuesdayDiscount > 0,
    };
  };

  // 총 할인률 계산
  const calculateTotalDiscountRate = () => {
    const { finalTotal } = calculateDiscounts();
    const originalSubtotal = getCartItemsWithDetails().reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 0);
    }, 0);

    if (originalSubtotal === 0) return 0;
    return Math.round(((originalSubtotal - finalTotal) / originalSubtotal) * 100);
  };

  // 포인트 계산 (basic과 동일한 로직)
  const calculatePoints = () => {
    const { finalTotal } = calculateDiscounts();
    let totalPoints = Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);

    // 화요일 보너스
    const today = new Date();
    const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
    if (isTuesday) {
      totalPoints *= POINT_POLICIES.TUESDAY_MULTIPLIER;
    }

    // 세트 보너스
    const hasKeyboard = cart.items.some((item) => item.id === PRODUCT_IDS.KEYBOARD);
    const hasMouse = cart.items.some((item) => item.id === PRODUCT_IDS.MOUSE);
    const hasMonitorArm = cart.items.some((item) => item.id === PRODUCT_IDS.MONITOR_ARM);

    if (hasKeyboard && hasMouse) {
      totalPoints += POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE;
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      totalPoints += POINT_POLICIES.SET_BONUSES.FULL_SET;
    }

    // 수량 보너스
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    Object.entries(POINT_POLICIES.QUANTITY_BONUSES).forEach(([threshold, bonus]) => {
      if (totalQuantity >= parseInt(threshold)) {
        totalPoints += bonus;
      }
    });

    return totalPoints;
  };

  // 포인트 상세 내역 생성 (basic과 동일한 로직)
  const createPointsDetail = () => {
    const { finalTotal } = calculateDiscounts();
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const today = new Date();
    const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
    const basePoints = Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);

    const pointsDetail = [];

    if (basePoints > 0) {
      pointsDetail.push(`기본: ${basePoints}p`);
    }

    if (isTuesday && basePoints > 0) {
      pointsDetail.push('화요일 2배');
    }

    // 세트 보너스
    const hasKeyboard = cart.items.some((item) => item.id === PRODUCT_IDS.KEYBOARD);
    const hasMouse = cart.items.some((item) => item.id === PRODUCT_IDS.MOUSE);
    const hasMonitorArm = cart.items.some((item) => item.id === PRODUCT_IDS.MONITOR_ARM);

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      pointsDetail.push('풀세트 구매 +100p');
    } else if (hasKeyboard && hasMouse) {
      pointsDetail.push('키보드+마우스 세트 +50p');
    }

    // 수량 보너스
    if (totalQuantity >= 30) {
      pointsDetail.push('대량구매(30개+) +100p');
    } else if (totalQuantity >= 20) {
      pointsDetail.push('대량구매(20개+) +50p');
    } else if (totalQuantity >= 10) {
      pointsDetail.push('대량구매(10개+) +20p');
    }

    return pointsDetail;
  };

  const cartItemsWithDetails = getCartItemsWithDetails();
  const subtotal = calculateSubtotal();
  const { finalTotal, discounts, isTuesday } = calculateDiscounts();
  const points = calculatePoints();
  const pointsDetail = createPointsDetail();
  const totalDiscountRate = calculateTotalDiscountRate();

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
