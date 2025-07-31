import { useEffect, useState } from 'react';

import { STOCK_POLICIES } from '../../lib/constants';
import { Product } from '../../lib/products';
import { saleService } from '../../lib/saleService';
import { useApp } from '../../lib/store';

const ProductPicker = () => {
  const { state, dispatch } = useApp();
  const [selectedProductId, setSelectedProductId] = useState(state.product.products[0]?.id || '');

  // 세일 서비스 시작
  useEffect(() => {
    saleService.startAllSales(dispatch, state.product.products, state.cart.lastSelectedProductId || '');
  }, [dispatch, state.product.products, state.cart.lastSelectedProductId]);

  const handleAddToCart = () => {
    if (!selectedProductId) return;

    const selectedProduct = state.product.products.find((p) => p.id === selectedProductId);
    if (!selectedProduct) return;

    if (selectedProduct.quantity === 0) {
      alert('재고가 부족합니다.');
      return;
    }

    const existingCartItem = state.cart.items.find((item) => item.id === selectedProductId);
    if (existingCartItem) {
      // 이미 장바구니에 있으면 수량 증가
      dispatch({
        type: 'UPDATE_CART_ITEM',
        payload: { productId: selectedProductId, quantity: existingCartItem.quantity + 1 },
      });
    } else {
      // 새로 추가
      dispatch({ type: 'ADD_TO_CART', payload: selectedProductId });
    }

    dispatch({ type: 'DECREASE_STOCK', payload: { productId: selectedProductId, quantity: 1 } });
    dispatch({ type: 'SET_LAST_SELECTED_PRODUCT_ID', payload: selectedProductId });
    // 선택된 값 유지 (초기화하지 않음)
  };

  // 할인 아이콘 생성
  const getSaleIcon = (product: Product) => {
    if (product.onSale && product.suggestSale) return '⚡💝';
    if (product.onSale) return '⚡';
    if (product.suggestSale) return '💝';
    return '';
  };

  // 상품 표시 텍스트 생성
  const getProductDisplayText = (product: Product) => {
    const icon = getSaleIcon(product);

    if (product.quantity === 0) {
      return `${product.name} - ${product.price.toLocaleString()}원 (품절)`;
    }

    let stockStatus = '';
    if (product.quantity > 0 && product.quantity < STOCK_POLICIES.LOW_STOCK_THRESHOLD) {
      stockStatus = ' (재고 부족)';
    }

    if (product.onSale && product.suggestSale) {
      return `${icon}${product.name} - ${product.price.toLocaleString()}원 → ${product.discountPrice.toLocaleString()}원 (25% SUPER SALE!)${stockStatus}`;
    } else if (product.onSale) {
      return `${icon}${product.name} - ${product.price.toLocaleString()}원 → ${product.discountPrice.toLocaleString()}원 (20% SALE!)${stockStatus}`;
    } else if (product.suggestSale) {
      return `${icon}${product.name} - ${product.price.toLocaleString()}원 → ${product.discountPrice.toLocaleString()}원 (5% 추천할인!)${stockStatus}`;
    } else {
      return `${product.name} - ${product.price.toLocaleString()}원${stockStatus}`;
    }
  };

  // 옵션 클래스 결정
  const getOptionClass = (product: Product) => {
    if (product.quantity === 0) return 'text-gray-400';
    if (product.onSale && product.suggestSale) return 'text-purple-600 font-bold';
    if (product.onSale) return 'text-red-500 font-bold';
    if (product.suggestSale) return 'text-blue-500 font-bold';
    return '';
  };

  // 총 재고 계산
  const totalStock = state.product.products.reduce((total, product) => total + product.quantity, 0);
  const isLowStock = totalStock < 50;

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        data-testid="product-select"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
        className={`w-full p-3 border border-gray-300 rounded-lg text-base mb-3 ${
          isLowStock ? 'border-orange-500' : ''
        }`}
      >
        {state.product.products.map((product) => (
          <option
            key={product.id}
            value={product.id}
            className={getOptionClass(product)}
            disabled={product.quantity === 0}
          >
            {getProductDisplayText(product)}
          </option>
        ))}
      </select>
      <button
        data-testid="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={!selectedProductId}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>
      {isLowStock && (
        <div className="text-xs text-orange-500 mt-2">⚠️ 전체 재고가 부족합니다 ({totalStock}개 남음)</div>
      )}
    </div>
  );
};

export default ProductPicker;
