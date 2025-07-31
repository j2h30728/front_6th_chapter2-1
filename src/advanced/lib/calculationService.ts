import { type CartItem } from '../store';
import { DISCOUNT_POLICIES, POINT_POLICIES, PRODUCT_IDS, UI_CONSTANTS } from './constants';
import { type Product } from './products';

export interface CartItemWithDetails extends Product {
  quantity: number;
}

export interface DiscountInfo {
  name: string;
  amount: number;
}

export interface DiscountResult {
  finalTotal: number;
  discounts: DiscountInfo[];
  isTuesday: boolean;
  bulkDiscount: boolean;
  tuesdayDiscount: boolean;
}

export interface IndividualDiscount {
  name: string;
  discount: number;
  savings: number;
}

export interface PointsDetail {
  points: number;
  details: string[];
}

// 장바구니 아이템과 상품 정보 결합
export const getCartItemsWithDetails = (cartItems: CartItem[], products: Product[]): CartItemWithDetails[] => {
  return cartItems.map((cartItem) => {
    const productInfo = products.find((p) => p.id === cartItem.id);
    return {
      ...productInfo!,
      quantity: cartItem.quantity,
    };
  });
};

// 서브토탈 계산
export const calculateSubtotal = (cartItemsWithDetails: CartItemWithDetails[]): number => {
  return cartItemsWithDetails.reduce((total, item) => {
    const { onSale, discountPrice, price, quantity } = item;
    const finalPrice = onSale ? discountPrice : price;
    return total + (finalPrice || 0) * (quantity || 0);
  }, 0);
};

// UI 표시용 서브토탈 계산 (할인 적용 전)
export const calculateDisplaySubtotal = (cartItemsWithDetails: CartItemWithDetails[]): number => {
  return cartItemsWithDetails.reduce((total, item) => {
    const { onSale, discountPrice, price, quantity } = item;
    const finalPrice = onSale ? discountPrice : price;
    return total + (finalPrice || 0) * (quantity || 0);
  }, 0);
};

// 개별 상품 할인 계산
export const calculateIndividualDiscounts = (cartItemsWithDetails: CartItemWithDetails[]): IndividualDiscount[] => {
  return cartItemsWithDetails
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

// 할인 계산
export const calculateDiscounts = (cartItems: CartItem[], products: Product[]): DiscountResult => {
  const cartItemsWithDetails = getCartItemsWithDetails(cartItems, products);
  const subtotal = calculateSubtotal(cartItemsWithDetails);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const bulkDiscount =
    totalQuantity >= DISCOUNT_POLICIES.BULK_DISCOUNT.THRESHOLD ? DISCOUNT_POLICIES.BULK_DISCOUNT.RATE : 0;
  const today = new Date();
  const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
  const tuesdayDiscount = isTuesday && subtotal > 0 ? DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.RATE : 0;

  let finalTotal = subtotal;
  const discounts: DiscountInfo[] = [];

  // 개별 상품 할인 적용 (대량 할인이 없을 때만)
  if (bulkDiscount === 0) {
    const individualDiscounts = calculateIndividualDiscounts(cartItemsWithDetails);
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
export const calculateTotalDiscountRate = (cartItems: CartItem[], products: Product[]): number => {
  const { finalTotal } = calculateDiscounts(cartItems, products);
  const cartItemsWithDetails = getCartItemsWithDetails(cartItems, products);
  const originalSubtotal = cartItemsWithDetails.reduce((total, item) => {
    return total + (item.price || 0) * (item.quantity || 0);
  }, 0);

  if (originalSubtotal === 0) return 0;
  return Math.round(((originalSubtotal - finalTotal) / originalSubtotal) * 100);
};

// 포인트 계산
export const calculatePoints = (cartItems: CartItem[], products: Product[]): number => {
  const { finalTotal } = calculateDiscounts(cartItems, products);
  let totalPoints = Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);

  // 화요일 보너스
  const today = new Date();
  const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
  if (isTuesday) {
    totalPoints *= POINT_POLICIES.TUESDAY_MULTIPLIER;
  }

  // 세트 보너스
  const hasKeyboard = cartItems.some((item) => item.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartItems.some((item) => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some((item) => item.id === PRODUCT_IDS.MONITOR_ARM);

  if (hasKeyboard && hasMouse) {
    totalPoints += POINT_POLICIES.SET_BONUSES.KEYBOARD_MOUSE;
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    totalPoints += POINT_POLICIES.SET_BONUSES.FULL_SET;
  }

  // 수량 보너스
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  Object.entries(POINT_POLICIES.QUANTITY_BONUSES).forEach(([threshold, bonus]) => {
    if (totalQuantity >= parseInt(threshold)) {
      totalPoints += bonus;
    }
  });

  return totalPoints;
};

// 포인트 상세 내역 생성
export const createPointsDetail = (cartItems: CartItem[], products: Product[]): string[] => {
  const { finalTotal } = calculateDiscounts(cartItems, products);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const today = new Date();
  const isTuesday = today.getDay() === DISCOUNT_POLICIES.SPECIAL_DISCOUNTS.TUESDAY.DAY_OF_WEEK;
  const basePoints = Math.floor(finalTotal * POINT_POLICIES.BASE_RATE);

  const pointsDetail: string[] = [];

  if (basePoints > 0) {
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  if (isTuesday && basePoints > 0) {
    pointsDetail.push('화요일 2배');
  }

  // 세트 보너스
  const hasKeyboard = cartItems.some((item) => item.id === PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartItems.some((item) => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some((item) => item.id === PRODUCT_IDS.MONITOR_ARM);

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
