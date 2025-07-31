import { useState } from 'react';

import { useApp } from '../lib/store';

export const useCart = () => {
  const { state, dispatch } = useApp();
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuantityChange = (productId: string, change: number) => {
    const cartItem = state.cart.items.find((item) => item.id === productId);
    if (!cartItem) return;

    const { quantity } = cartItem;
    const newQuantity = quantity + change;

    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      dispatch({ type: 'INCREASE_STOCK', payload: { productId, quantity } });
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
      const { quantity } = cartItem;
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      dispatch({ type: 'INCREASE_STOCK', payload: { productId, quantity } });
      setErrorMsg('');
    }
  };

  const handleAddToCart = (selectedProductId: string) => {
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

  return {
    cartItems: state.cart.items,
    products: state.product.products,
    errorMsg,
    handleQuantityChange,
    handleRemoveItem,
    handleAddToCart,
  };
};
