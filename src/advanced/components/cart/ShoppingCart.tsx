import { useState } from 'react';

import { type Product } from '../../lib/products';
import { useApp } from '../../lib/store';
import ProductPicker from './ProductPicker';

const ShoppingCart = () => {
  const { state, dispatch } = useApp();
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuantityChange = (productId: string, change: number) => {
    const cartItem = state.cart.items.find((item) => item.id === productId);
    if (!cartItem) return;

    const newQuantity = cartItem.quantity + change;

    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      dispatch({ type: 'INCREASE_STOCK', payload: { productId, quantity: cartItem.quantity } });
      setErrorMsg('');
    } else {
      const product = state.product.products.find((p) => p.id === productId);
      if (product && newQuantity > product.quantity) {
        alert('재고가 부족합니다.');
        return;
      }
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { productId, quantity: newQuantity } });
      dispatch({ type: 'DECREASE_STOCK', payload: { productId, quantity: change } });
      setErrorMsg('');
    }
  };

  const handleRemoveItem = (productId: string) => {
    const cartItem = state.cart.items.find((item) => item.id === productId);
    if (cartItem) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      dispatch({ type: 'INCREASE_STOCK', payload: { productId, quantity: cartItem.quantity } });
      setErrorMsg('');
    }
  };

  const getProductDisplayName = (product: Product) => {
    if (product.onSale && product.suggestSale) {
      return `⚡💝${product.name}`;
    } else if (product.onSale) {
      return `⚡${product.name}`;
    } else if (product.suggestSale) {
      return `💝${product.name}`;
    }
    return product.name;
  };

  const getProductPriceDisplay = (product: Product) => {
    if (product.onSale || product.suggestSale) {
      const priceClass =
        product.onSale && product.suggestSale ? 'text-purple-600' : product.onSale ? 'text-red-500' : 'text-blue-500';
      return (
        <>
          <span className="line-through text-gray-400">₩{product.price.toLocaleString()}</span>{' '}
          <span className={priceClass}>₩{product.discountPrice.toLocaleString()}</span>
        </>
      );
    }
    return <span>₩{product.price.toLocaleString()}</span>;
  };

  return (
    <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
      <ProductPicker />
      {errorMsg && (
        <div className="text-red-500 text-xs mb-2" data-testid="cart-error">
          {errorMsg}
        </div>
      )}
      <div id="cart-items">
        {state.cart.items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">장바구니가 비어있습니다.</div>
        ) : (
          state.cart.items.map((cartItem) => {
            const product = state.product.products.find((p) => p.id === cartItem.id);
            if (!product) return null;

            return (
              <div
                key={cartItem.id}
                data-testid={`cart-item-${cartItem.id}`}
                className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                </div>
                <div>
                  <h3 className="text-base font-normal mb-1 tracking-tight">{getProductDisplayName(product)}</h3>
                  <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
                  <p className="text-xs text-black mb-3">{getProductPriceDisplay(product)}</p>
                  <div className="flex items-center gap-4">
                    <button
                      data-testid="decrease-qty-btn"
                      data-change="-1"
                      onClick={() => handleQuantityChange(cartItem.id, -1)}
                      className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                    >
                      −
                    </button>
                    <span
                      data-testid="cart-item-qty"
                      className="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums"
                    >
                      {cartItem.quantity}
                    </span>
                    <button
                      data-testid="increase-qty-btn"
                      data-change="1"
                      onClick={() => handleQuantityChange(cartItem.id, 1)}
                      disabled={product.quantity === 0}
                      className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg mb-2 tracking-tight tabular-nums">
                    ₩{((product.onSale ? product.discountPrice : product.price) * cartItem.quantity).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(cartItem.id)}
                    className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
