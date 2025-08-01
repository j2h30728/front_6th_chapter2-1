export interface Product {
  id: string;
  name: string;
  discountPrice: number;
  price: number;
  quantity: number;
  onSale: boolean;
  suggestSale: boolean;
  discountRate: number;
}

export const PRODUCT_IDS = {
  p1: 'p1',
  p2: 'p2',
  p3: 'p3',
  p4: 'p4',
  p5: 'p5',
} as const;

export const PRODUCTS = [
  {
    id: 'p1',
    name: '버그 없애는 키보드',
    discountPrice: 10000,
    price: 10000,
    quantity: 50,
    onSale: false,
    suggestSale: false,
    discountRate: 0.1,
  },
  {
    id: 'p2',
    name: '생산성 폭발 마우스',
    discountPrice: 20000,
    price: 20000,
    quantity: 30,
    onSale: false,
    suggestSale: false,
    discountRate: 0.15,
  },
  {
    id: 'p3',
    name: '거북목 탈출 모니터암',
    discountPrice: 30000,
    price: 30000,
    quantity: 20,
    onSale: false,
    suggestSale: false,
    discountRate: 0.2,
  },
  {
    id: 'p4',
    name: '에러 방지 노트북 파우치',
    discountPrice: 15000,
    price: 15000,
    quantity: 0,
    onSale: false,
    suggestSale: false,
    discountRate: 0.05,
  },
  {
    id: 'p5',
    name: '코딩할 때 듣는 Lo-Fi 스피커',
    discountPrice: 25000,
    price: 25000,
    quantity: 10,
    onSale: false,
    suggestSale: false,
    discountRate: 0.25,
  },
];

export const createInitialProducts = (): Product[] => {
  return PRODUCTS.map((product) => ({
    id: product.id,
    name: product.name,
    discountPrice: product.discountPrice,
    price: product.price,
    quantity: product.quantity,
    onSale: product.onSale,
    suggestSale: product.suggestSale,
    discountRate: product.discountRate,
  }));
};
