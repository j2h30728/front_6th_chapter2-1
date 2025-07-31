// 🏪 상품 ID 상수 - 일관된 네이밍으로 통일
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_POUCH: 'p4',
  SPEAKER: 'p5',
};

// 🏪 할인 정책 설정
export const DISCOUNT_POLICIES = {
  // 개별 상품 할인율 (10개 이상 구매 시)
  INDIVIDUAL_DISCOUNTS: {
    [PRODUCT_IDS.KEYBOARD]: 0.1, // 10%
    [PRODUCT_IDS.MOUSE]: 0.15, // 15%
    [PRODUCT_IDS.MONITOR_ARM]: 0.2, // 20%
    [PRODUCT_IDS.LAPTOP_POUCH]: 0.05, // 5%
    [PRODUCT_IDS.SPEAKER]: 0.25, // 25%
  },

  // 대량 구매 할인
  BULK_DISCOUNT: {
    THRESHOLD: 30, // 30개 이상
    RATE: 0.25, // 25%
  },

  // 특별 할인
  SPECIAL_DISCOUNTS: {
    TUESDAY: {
      RATE: 0.1, // 10%
      DAY_OF_WEEK: 2, // 화요일 (0=일요일, 1=월요일, 2=화요일)
    },
    LIGHTNING_SALE: {
      RATE: 0.2, // 20%
    },
    RECOMMENDED_SALE: {
      RATE: 0.05, // 5%
    },
  },
};

// 🏪 포인트 정책 설정
export const POINT_POLICIES = {
  // 기본 포인트 적립률
  BASE_RATE: 0.001, // 0.1% (1000원당 1포인트)

  // 화요일 보너스
  TUESDAY_MULTIPLIER: 2, // 2배

  // 세트 보너스
  SET_BONUSES: {
    KEYBOARD_MOUSE: 50, // 키보드+마우스 세트
    FULL_SET: 100, // 풀세트 (키보드+마우스+모니터암)
  },

  // 수량 보너스
  QUANTITY_BONUSES: {
    [10]: 20, // 10개 이상 +20p
    [20]: 50, // 20개 이상 +50p
    [30]: 100, // 30개 이상 +100p
  },
};

// 🏪 재고 관리 설정
export const STOCK_POLICIES = {
  LOW_STOCK_THRESHOLD: 5, // 5개 미만 시 재고 부족 표시
  OUT_OF_STOCK: 0, // 0개 시 품절
};

// 🏪 상품 정보 설정
export const PRODUCT_DATA = {
  KEYBOARD: {
    name: '버그 없애는 키보드',
    price: 10000,
    stock: 50,
  },
  MOUSE: {
    name: '생산성 폭발 마우스',
    price: 20000,
    stock: 30,
  },
  MONITOR_ARM: {
    name: '거북목 탈출 모니터암',
    price: 30000,
    stock: 20,
  },
  LAPTOP_POUCH: {
    name: '에러 방지 노트북 파우치',
    price: 15000,
    stock: 0,
  },
  SPEAKER: {
    name: '코딩할 때 듣는 Lo-Fi 스피커',
    price: 25000,
    stock: 10,
  },
};

// 🏪 UI 설정
export const UI_CONSTANTS = {
  DEFAULT_ITEM_COUNT: 0,
  DEFAULT_TOTAL_AMOUNT: 0,
  DEFAULT_ITEM_COUNT_DISPLAY: '🛍️ 0 items in cart',
  DEFAULT_POINTS_DISPLAY: '적립 포인트: 0p',
  QUANTITY_THRESHOLD_FOR_BOLD: 10,
  TOTAL_STOCK_WARNING_THRESHOLD: 50,
};

// 🏪 타이머 설정
export const TIMER_SETTINGS = {
  LIGHTNING_SALE_INTERVAL: 30000, // 30초
  LIGHTNING_SALE_DELAY_MAX: 10000, // 최대 10초 지연
  RECOMMENDED_SALE_INTERVAL: 60000, // 60초
  RECOMMENDED_SALE_DELAY_MAX: 20000, // 최대 20초 지연
};
