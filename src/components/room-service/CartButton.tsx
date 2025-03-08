
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface CartButtonProps {
  cartItems: { item: any; quantity: number }[];
  calculateTotal: () => number;
  openCart: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ cartItems, calculateTotal, openCart }) => {
  if (cartItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-10"
    >
      <button
        onClick={openCart}
        className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition-all"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-medium">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
        <span className="font-bold">${calculateTotal().toFixed(2)}</span>
      </button>
    </motion.div>
  );
};

export default CartButton;
