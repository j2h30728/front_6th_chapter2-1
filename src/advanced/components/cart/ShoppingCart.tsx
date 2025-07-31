import { useCart } from '../../hooks';
import { type Product } from '../../lib/products';
import { getProductDisplayName, getProductPriceDisplay } from '../../lib/uiUtils';
import ProductPicker from './ProductPicker';

const ShoppingCart = () => {
  const { cartItems, products, errorMsg, handleQuantityChange, handleRemoveItem } = useCart();

  const renderProductPrice = (product: Product) => {
    const priceInfo = getProductPriceDisplay(product);

    if (priceInfo.discountPrice) {
      return (
        <>
          <span className="line-through text-gray-400">₩{priceInfo.originalPrice}</span>{' '}
          <span className={priceInfo.priceClass}>₩{priceInfo.discountPrice}</span>
        </>
      );
    }
    return <span>₩{priceInfo.originalPrice}</span>;
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
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">장바구니가 비어있습니다.</div>
        ) : (
          cartItems.map((cartItem) => {
            const product = products.find((p) => p.id === cartItem.id);
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
                  <p className="text-xs text-black mb-3">{renderProductPrice(product)}</p>
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
