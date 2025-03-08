
import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  available?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { formatPrice, t } = useLanguage();
  
  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };
  
  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Simulate API call
    setTimeout(() => {
      onAddToCart(item, quantity);
      setIsAddingToCart(false);
      setQuantity(1);
    }, 500);
  };
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group relative"
    >
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Info size={16} />
        </div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute bottom-3 right-3">
          <span className="bg-white dark:bg-slate-900 text-primary dark:text-primary font-medium px-3 py-1 rounded-full text-sm shadow-md">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-medium text-lg mb-2">{item.name}</h3>
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button 
              onClick={handleDecrement}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
            <button 
              onClick={handleIncrement}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isAddingToCart 
                ? 'bg-muted text-muted-foreground cursor-wait' 
                : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t('button.add')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItem;
