
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, X, Clock, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MenuItemType } from '../MenuItem';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { formatPrice } = useLanguage();
  
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-auto shadow-xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-light text-primary">Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {cart.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center">
                <Clock className="h-5 w-5 mr-3 text-primary/80" />
                <div>
                  <h3 className="font-medium text-sm">Estimated Delivery Time</h3>
                  <p className="text-sm text-muted-foreground/80">
                    Between {deliveryTime.min} and {deliveryTime.max}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {cart.map(cartItem => (
                  <div 
                    key={cartItem.item.id}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{cartItem.item.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-muted-foreground/80">
                          {formatPrice(cartItem.item.price)} × {cartItem.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-4">
                        {formatPrice(cartItem.item.price * cartItem.quantity)}
                      </span>
                      <button
                        onClick={() => onRemoveFromCart(cartItem.item.id)}
                        className="p-1.5 bg-white dark:bg-slate-700 text-muted-foreground hover:text-destructive rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground/80">Subtotal</span>
                  <span className="font-medium">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground/80">Service charge (10%)</span>
                  <span className="font-medium">{formatPrice(calculateTotal() * 0.1)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(calculateTotal() * 1.1)}</span>
                </div>
              </div>
              
              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="font-medium mb-3 text-primary/80">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setPaymentMethod('checkout')}
                    variant={paymentMethod === 'checkout' ? 'default' : 'outline'}
                    className={`flex items-center justify-center py-6 ${
                      paymentMethod === 'checkout' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    <span>Pay at Checkout</span>
                  </Button>
                  <Button
                    onClick={() => setPaymentMethod('card')}
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className={`flex items-center justify-center py-6 ${
                      paymentMethod === 'card' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Pay by Card</span>
                  </Button>
                </div>
              </div>
              
              <button
                onClick={onSubmitOrder}
                disabled={isSubmitting || !paymentMethod}
                className={`w-full py-4 rounded-lg font-medium text-center transition-all flex items-center justify-center gap-2
                  ${isSubmitting 
                    ? 'bg-muted text-muted-foreground cursor-wait' 
                    : !paymentMethod
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
              >
                {isSubmitting ? 
                  'Processing...' : 
                  paymentMethod ? 
                    <>Place Order <ChevronRight className="h-4 w-4" /></> : 
                    'Select Payment Method'
                }
              </button>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-5">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/70" />
              </div>
              <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground/80 font-light">
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
