import { STOCK_POLICIES } from './constants';
import { type Product } from './products';

// 할인 아이콘 생성
export const getSaleIcon = (product: Product): string => {
  const { onSale, suggestSale } = product;

  if (onSale && suggestSale) return '⚡💝';
  if (onSale) return '⚡';
  if (suggestSale) return '💝';
  return '';
};

// 상품 표시 텍스트 생성
export const getProductDisplayText = (product: Product): string => {
  const icon = getSaleIcon(product);
  const { name, price, discountPrice, quantity, onSale, suggestSale } = product;

  if (quantity === 0) {
    return `${name} - ${price.toLocaleString()}원 (품절)`;
  }

  const stockStatus = quantity > 0 && quantity < STOCK_POLICIES.LOW_STOCK_THRESHOLD ? ' (재고 부족)' : '';

  if (onSale && suggestSale) {
    return `${icon}${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (25% SUPER SALE!)${stockStatus}`;
  } else if (onSale) {
    return `${icon}${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (20% SALE!)${stockStatus}`;
  } else if (suggestSale) {
    return `${icon}${name} - ${price.toLocaleString()}원 → ${discountPrice.toLocaleString()}원 (5% 추천할인!)${stockStatus}`;
  } else {
    return `${name} - ${price.toLocaleString()}원${stockStatus}`;
  }
};

// 옵션 클래스 결정
export const getOptionClass = (product: Product): string => {
  const { quantity, onSale, suggestSale } = product;

  if (quantity === 0) return 'text-gray-400';
  if (onSale && suggestSale) return 'text-purple-600 font-bold';
  if (onSale) return 'text-red-500 font-bold';
  if (suggestSale) return 'text-blue-500 font-bold';
  return '';
};

// 상품 표시 이름 생성
export const getProductDisplayName = (product: Product): string => {
  const { name, onSale, suggestSale } = product;

  if (onSale && suggestSale) {
    return `⚡💝${name}`;
  } else if (onSale) {
    return `⚡${name}`;
  } else if (suggestSale) {
    return `💝${name}`;
  }
  return name;
};

// 상품 가격 표시 컴포넌트 클래스 결정
export const getProductPriceClass = (product: Product): string => {
  const { onSale, suggestSale } = product;

  if (onSale && suggestSale) return 'text-purple-600';
  if (onSale) return 'text-red-500';
  if (suggestSale) return 'text-blue-500';
  return '';
};

// 재고 상태 확인
export const getStockStatus = (products: Product[]): { totalStock: number; isLowStock: boolean } => {
  const totalStock = products.reduce((total, product) => total + product.quantity, 0);
  const isLowStock = totalStock < 50;

  return { totalStock, isLowStock };
};

// 상품 가격 표시 컴포넌트 생성
export const getProductPriceDisplay = (product: Product) => {
  const { price, discountPrice, onSale, suggestSale } = product;
  const priceClass = getProductPriceClass(product);

  if (onSale || suggestSale) {
    return {
      originalPrice: price.toLocaleString(),
      discountPrice: discountPrice.toLocaleString(),
      priceClass,
    };
  }

  return {
    originalPrice: price.toLocaleString(),
    discountPrice: null,
    priceClass: '',
  };
};
