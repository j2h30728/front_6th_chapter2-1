import { useMemo } from 'react';

import { useApp } from '../lib/store';

export const useCartInfo = () => {
  const { state } = useApp();
  const { cart } = state;

  const cartInfo = useMemo(() => {
    return {
      itemCount: cart.itemCount,
      totalAmount: cart.totalAmount,
      isEmpty: cart.items.length === 0,
    };
  }, [cart.itemCount, cart.totalAmount, cart.items.length]);

  return cartInfo;
};
