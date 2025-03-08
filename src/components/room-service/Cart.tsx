
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, X, Clock, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MenuItemType } from '../MenuItem';

interface CartProps {
  isOpen: boolean;
  cart: { item: MenuItemType; quantity: number }[];
  onClose: () => void;
  onRemoveFromCart: (itemId: string) => void;
  isSubmitting: boolean;
  paymentMethod: 'checkout' | 'card' | null;
  setPaymentMethod: (method: 'checkout' | 'card' | null) => void;
  onSubmitOrder: () => void;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  cart,
  onClose,
  onRemoveFromCart,
  isSubmitting,
  paymentMethod,
  setPaymentMethod,
  onSubmitOrder,
}) => {
  if (!isOpen) return null;

  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
  };

  // Estimate delivery time (20-40 minutes from now)
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 20 * 60000);
    const maxTime = new Date(now.getTime() + 40 * 60000);
    
    return {
      min: minTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      max: maxTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const deliveryTime = getEstimatedDeliveryTime();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-background h-full overflow-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {cart.length > 0 ? (
            <>
              <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border flex items-center">
                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-sm">Estimated Delivery Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Between {deliveryTime.min} and {deliveryTime.max}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {cart.map(cartItem => (
                  <div 
                    key={cartItem.item.id}
                    className="flex justify-between items-center py-3 border-b border-border"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{cartItem.item.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          ${cartItem.item.price.toFixed(2)} × {cartItem.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-4">
                        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => onRemoveFromCart(cartItem.item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Service charge (10%)</span>
                  <span className="font-medium">${(calculateTotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setPaymentMethod('checkout')}
                    variant={paymentMethod === 'checkout' ? 'default' : 'outline'}
                    className="flex items-center justify-center py-6"
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    <span>Pay at Checkout</span>
                  </Button>
                  <Button
                    onClick={() => setPaymentMethod('card')}
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="flex items-center justify-center py-6"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Pay by Card</span>
                  </Button>
                </div>
              </div>
              
              <button
                onClick={onSubmitOrder}
                disabled={isSubmitting || !paymentMethod}
                className={`w-full py-3 rounded-lg font-medium text-center transition-all
                  ${isSubmitting 
                    ? 'bg-muted text-muted-foreground cursor-wait' 
                    : !paymentMethod
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
              >
                {isSubmitting ? 'Processing...' : paymentMethod ? 'Place Order' : 'Select Payment Method'}
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground">
                Add some delicious items from the menu
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
