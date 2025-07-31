import { useEffect } from 'react';

import { saleService } from '../lib/saleService';
import { useApp } from '../store';

export const useSaleService = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    saleService.startAllSales(dispatch, state.product.products, state.cart.lastSelectedProductId || '');
  }, [dispatch, state.product.products, state.cart.lastSelectedProductId]);

  return {
    products: state.product.products,
  };
};
