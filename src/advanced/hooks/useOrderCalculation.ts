import { useMemo } from 'react';

import {
  calculateDiscounts,
  calculateDisplaySubtotal,
  calculatePoints,
  calculateTotalDiscountRate,
  createPointsDetail,
  getCartItemsWithDetails,
} from '../lib/calculationService';
import { useApp } from '../lib/store';

export const useOrderCalculation = () => {
  const { state } = useApp();
  const { cart, product } = state;

  const cartItemsWithDetails = useMemo(() => {
    return getCartItemsWithDetails(cart.items, product.products);
  }, [cart.items, product.products]);

  const discountResult = useMemo(() => {
    return calculateDiscounts(cart.items, product.products);
  }, [cart.items, product.products]);

  const points = useMemo(() => {
    return calculatePoints(cart.items, product.products);
  }, [cart.items, product.products]);

  const pointsDetail = useMemo(() => {
    return createPointsDetail(cart.items, product.products);
  }, [cart.items, product.products]);

  const totalDiscountRate = useMemo(() => {
    return calculateTotalDiscountRate(cart.items, product.products);
  }, [cart.items, product.products]);

  const displaySubtotal = useMemo(() => {
    return calculateDisplaySubtotal(cartItemsWithDetails);
  }, [cartItemsWithDetails]);

  return {
    cartItemsWithDetails,
    discountResult,
    points,
    pointsDetail,
    totalDiscountRate,
    displaySubtotal,
  };
};
