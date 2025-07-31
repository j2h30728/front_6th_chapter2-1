import { useEffect, useState } from 'react';

import { useCart } from '../../hooks';
import { saleService } from '../../lib/saleService';
import { useApp } from '../../lib/store';
import { getOptionClass, getProductDisplayText, getStockStatus } from '../../lib/uiUtils';

const ProductPicker = () => {
  const { state, dispatch } = useApp();
  const { handleAddToCart: addToCart } = useCart();
  const [selectedProductId, setSelectedProductId] = useState(state.product.products[0]?.id || '');

  // 세일 서비스 시작
  useEffect(() => {
    saleService.startAllSales(dispatch, state.product.products, state.cart.lastSelectedProductId || '');
  }, [dispatch, state.product.products, state.cart.lastSelectedProductId]);

  const handleAddToCart = () => {
    addToCart(selectedProductId);
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
