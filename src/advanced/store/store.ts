import React, { createContext, ReactNode, useContext, useReducer } from 'react';

import { createInitialProducts, type Product } from '../lib/products';

// Types
export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  lastSelectedProductId: string | null;
}

export interface ProductState {
  products: Product[];
}

export interface AppState {
  cart: CartState;
  product: ProductState;
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'SET_LAST_SELECTED_PRODUCT_ID'; payload: string | null }
  | { type: 'RESET_CART' };

export type ProductAction =
  | { type: 'DECREASE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'INCREASE_STOCK'; payload: { productId: string; quantity: number } }
  | {
      type: 'SET_PRODUCT_SALE';
      payload: { productId: string; newPrice: number; onSale: boolean; suggestSale?: boolean };
    }
  | { type: 'RESET_PRODUCT_SALE'; payload: { productId: string } };

export type AppAction = CartAction | ProductAction;

// Reducers
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find((item) => item.id === action.payload);
      const newItems = existingItem
        ? state.items.map((item) => {
            const { id, quantity } = item;
            return id === action.payload ? { ...item, quantity: quantity + 1 } : item;
          })
        : [...state.items, { id: action.payload, quantity: 1 }];
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        items: newItems,
        itemCount: newItemCount,
      };
    }
    case 'UPDATE_CART_ITEM': {
      const { productId, quantity } = action.payload;
      const newItems = state.items.map((item) => {
        const { id } = item;
        return id === productId ? { ...item, quantity } : item;
      });
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        items: newItems,
        itemCount: newItemCount,
      };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter((item) => {
        const { id } = item;
        return id !== action.payload;
      });
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        items: newItems,
        itemCount: newItemCount,
      };
    }
    case 'SET_LAST_SELECTED_PRODUCT_ID':
      return { ...state, lastSelectedProductId: action.payload };
    case 'RESET_CART':
      return {
        items: [],
        itemCount: 0,
        totalAmount: 0,
        lastSelectedProductId: null,
      };
    default:
      return state;
  }
};

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, quantity: Math.max(0, product.quantity - action.payload.quantity) }
            : product
        ),
      };
    case 'INCREASE_STOCK':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? { ...product, quantity: product.quantity + action.payload.quantity }
            : product
        ),
      };
    case 'SET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                discountPrice: action.payload.newPrice,
                onSale: action.payload.onSale,
                suggestSale: action.payload.suggestSale || product.suggestSale,
              }
            : product
        ),
      };
    case 'RESET_PRODUCT_SALE':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.productId
            ? {
                ...product,
                discountPrice: product.price,
                onSale: false,
                suggestSale: false,
              }
            : product
        ),
      };
    default:
      return state;
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  return {
    cart: cartReducer(state.cart, action as CartAction),
    product: productReducer(state.product, action as ProductAction),
  };
};

// Initial State
const initialState: AppState = {
  cart: {
    items: [],
    itemCount: 0,
    totalAmount: 0,
    lastSelectedProductId: null,
  },
  product: {
    products: createInitialProducts(),
  },
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children);
};
