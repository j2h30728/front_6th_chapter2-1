import { useEffect, useState } from 'react';

import { saleService } from '../../lib/saleService';
import { useApp } from '../../lib/store';
import { getOptionClass, getProductDisplayText, getStockStatus } from '../../lib/uiUtils';

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
  };

  // 총 재고 계산
  const { totalStock, isLowStock } = getStockStatus(state.product.products);

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
