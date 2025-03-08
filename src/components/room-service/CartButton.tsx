
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartButtonProps {
  cartItems: { item: any; quantity: number }[];
  calculateTotal: () => number;
  openCart: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ cartItems, calculateTotal, openCart }) => {
  const { formatPrice } = useLanguage();
  
  if (cartItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 inset-x-0 mx-auto flex justify-center z-50"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openCart}
        className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-medium text-sm">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
        <div className="w-px h-4 bg-white/30 mx-1"></div>
        <span className="font-bold">{formatPrice(calculateTotal())}</span>
      </motion.button>
    </motion.div>
  );
};

export default CartButton;
