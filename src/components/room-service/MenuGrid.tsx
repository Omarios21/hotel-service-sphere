
import React from 'react';
import { motion } from 'framer-motion';
import MenuItem, { MenuItemType } from '../MenuItem';

interface MenuGridProps {
  items: MenuItemType[];
  isLoading: boolean;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

const MenuGrid: React.FC<MenuGridProps> = ({ items, isLoading, onAddToCart }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin-slow h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-muted-foreground font-light">No items available in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <MenuItem item={item} onAddToCart={onAddToCart} />
        </motion.div>
      ))}
    </div>
  );
};

export default MenuGrid;
